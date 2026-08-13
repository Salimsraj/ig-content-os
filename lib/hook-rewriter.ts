import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "data", "cache", "hook-rewrites-live.json");
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type RewriteResult = {
  rewrittenHook: string;
  principle: string;
};

type CacheEntry = { fetchedAt: number; hookHash: string; result: RewriteResult };

function readCache(): Record<string, CacheEntry> {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeCache(store: Record<string, CacheEntry>) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return String(h);
}

const SYSTEM_PROMPT = `You rewrite the opening hook (first 1-2 spoken sentences) of Arabic/Shami-dialect short-form video scripts to reduce skip rate, using this framework:

THE CORE MECHANISM: a hook works by opening a curiosity loop — an unanswered question in the viewer's head. Everything below is a lever for creating or strengthening that.

FIVE LEVERS, IN PRIORITY ORDER:
1. Contrast is the engine. Base state -> end state, expectation -> reality, "everyone thinks X -> actually Y". The SIZE of the gap drives curiosity, not cleverness of phrasing.
2. Context must land immediately - who this is for and what it's about, in the first breath, before curiosity can even form.
3. Specificity beats a "hook-sounding" hook. A line that obviously performs the role of "hook" (generic imperative, "stop doing X") triggers ad-skepticism. A concrete, specific claim (a number, a named mechanism, a real instance) reads as information, not pitch.
4. Any bold claim needs a proof signal closed fast (a number, a personal result) or it opens a worse loop: "is this even true?"
5. Match the audience's own language/register, not generic marketing-speak.

GRAMMAR UNDERNEATH: Subject + Action + Objective + Contrast. e.g. "[I] [spent 2 hours on X] -> [Claude did it in 2 minutes]."

TASK: Given an original hook (with skip rate and diagnosis), rewrite it in the SAME Arabic/Shami dialect and register as the original — casual, mixed with English/tech terms the same way the original does. Keep it to 1-2 short sentences. Output ONLY valid JSON: {"rewrittenHook": "...", "principle": "one short sentence naming which lever was weakest and how the rewrite fixes it"}`;

export async function generateHookRewrite(
  mediaId: string,
  originalHook: string,
  fullTranscript: string,
  diagnosisPattern: string,
  skipRate: number
): Promise<RewriteResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const cacheKey = mediaId;
  const currentHash = hash(originalHook);
  const cache = readCache();
  const cached = cache[cacheKey];
  if (cached && cached.hookHash === currentHash && Date.now() - cached.fetchedAt < ONE_DAY_MS) {
    return cached.result;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Original hook: "${originalHook}"\nSkip rate: ${skipRate}%\nDiagnosis: ${diagnosisPattern}\nFull video transcript (for context on what comes next): "${fullTranscript.slice(0, 500)}"`,
          },
        ],
        thinking: {
          type: "disabled",
        },
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", await response.text());
      return null;
    }

    const data = await response.json();
    // Find the text content block (skipping thinking blocks) — without this,
    // data.content?.[0] can be a thinking block instead of text, leaving
    // `text` empty and crashing JSON.parse below.
    const textBlock = data.content?.find((block: { type: string; text?: string }) => block.type === "text");
    const text: string = textBlock?.text || "";
    if (!text.trim()) {
      console.error("Anthropic returned no text for hook rewrite. Content types:", data.content?.map((c: { type: string }) => c.type));
      return null;
    }
    const parsed = JSON.parse(text);

    const result: RewriteResult = {
      rewrittenHook: parsed.rewrittenHook,
      principle: parsed.principle,
    };

    cache[cacheKey] = { fetchedAt: Date.now(), hookHash: currentHash, result };
    writeCache(cache);

    return result;
  } catch (error) {
    console.error("Hook rewrite generation failed:", error);
    return null;
  }
}
