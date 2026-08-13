import fs from "fs";
import path from "path";
import { getTopScoringHooks, getHookTemplatesSample, formatScoredHooksNumbered, formatHookTemplatesNumbered } from "./viral-hook-patterns";

const CACHE_FILE = path.join(process.cwd(), "data", "cache", "hook-evaluations.json");
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Matches the thresholds used for live reels in app/api/instagram-content/route.ts
export const HIGH_SKIP = 50;
export const LOW_SKIP = 30;

export type HookEvaluation = {
  score: number; // 0-100
  skipRatePrediction: number; // 0-100
  retentionPrediction: number; // 100 - skipRate
  levers: {
    contrast: number; // 0-10
    context: number;
    specificity: number;
    proof: number;
    register: number;
  };
  weakestLever: string;
  issues: string[];
  strengths: string[];
  reasoning: string;
};

export type HookSuggestion = {
  hook: string;
  skipRatePrediction: number;
  principle: string;
  // Verified provenance: looked up in code from the index the model cited,
  // not trusted from the model's own claim. Null when the model's cited
  // index didn't actually resolve to something we sent it (ungrounded).
  // These are inspiration sources (idea/register), not a literal skeleton
  // the hook is required to translate — so there's no pass/fail structure
  // check here, just "here's what this was inspired by" for transparency.
  sourceTemplate: { category: string; template: string } | null;
  sourceHook: { hook: string; score: number } | null;
};

type CacheEntry = { fetchedAt: number; result: unknown };

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

// The same five-lever framework used by lib/hook-rewriter.ts, expressed as a
// scoring rubric instead of a rewriting instruction.
const FRAMEWORK = `THE CORE MECHANISM: a hook works by opening a curiosity loop — an unanswered question in the viewer's head. Everything below is a lever for creating or strengthening that.

FIVE LEVERS, IN PRIORITY ORDER:
1. CONTRAST is the engine. Base state -> end state, expectation -> reality, "everyone thinks X -> actually Y". The SIZE of the gap drives curiosity, not cleverness of phrasing.
2. CONTEXT must land immediately — who this is for and what it's about, in the first breath, before curiosity can even form. Delaying context to the back half of the first sentence raises skip rate sharply.
3. SPECIFICITY beats a "hook-sounding" hook. A line that obviously performs the role of "hook" (generic imperative, "stop doing X") triggers ad-skepticism and gets skipped. A concrete, specific claim (a number, a named mechanism, a real instance) reads as information, not pitch.
4. PROOF: any bold claim needs a proof signal closed fast (a number, a personal result) or it opens a worse loop: "is this even true?"
5. REGISTER: match the audience's own language, not generic marketing-speak. Jargon the audience does not use is a skip trigger.

GRAMMAR UNDERNEATH: Subject + Action + Objective + Contrast. e.g. "[I] [spent 2 hours on X] -> [Claude did it in 2 minutes]."`;

const EVAL_SYSTEM = `You are an expert at evaluating short-form video hooks (Instagram Reels).

FIVE LEVERS THAT DRIVE SKIP RATE:
1. CONTRAST — gap between expectation and reality drives curiosity
2. CONTEXT — who this is for and what it's about, stated immediately
3. SPECIFICITY — concrete claims vs generic marketing-speak
4. PROOF — closing the loop quickly with a proof signal (number, result, evidence)
5. REGISTER — matching the audience's language, not formal jargon

SCORING: Under 30% skip = good (target). 30-50% = leaking. 50%+ = failing.

IMPORTANT: If the hook is in Arabic/Shami dialect with code-switching, judge it in that dialect. Do NOT penalize code-switching or non-English language.

TASK: Score this hook (0-100) and predict skip rate (0-100%). Return ONLY valid JSON:
{"score": 0-100, "skipRatePrediction": 0-100, "levers": {"contrast": 0-10, "context": 0-10, "specificity": 0-10, "proof": 0-10, "register": 0-10}, "weakestLever": "contrast|context|specificity|proof|register", "issues": ["..."], "strengths": ["..."], "reasoning": "2 sentences"}`;

const SUGGEST_SYSTEM = `You write Arabic/Shami hooks for short-form video by MODELING them on real reference material — never inventing your own structure from scratch, and never translating anything word-for-word.

You get two lists each call, both sampled fresh from a growing dataset (read them fresh every time, don't rely on patterns from past calls):

1. SCORED ARABIC HOOKS — real hooks from Arabic-dialect creators, numbered, each with its actual score (0-100) on the 5-lever framework (contrast, context, specificity, proof, register) and which levers scored highest. These show you the correct REGISTER and PROOF style for this audience — how a real Arabic/Shami hook actually sounds.

2. HOOK TEMPLATES — fill-in-the-blank English structural formulas, numbered, tagged by category (EDUCATIONAL, COMPARISON, MYTH BUSTING, STORYTELLING, AUTHORITY, DAY IN THE LIFE). These are IDEAS for a hook's underlying shape (e.g. "a myth vs. the real reason", "a before/after comparison", "I did X so you don't have to") — not sentences to translate. Extract the idea, forget the exact English wording.

IMPORTANT — LENGTH: a real hook is only what gets SPOKEN OR SHOWN in the first 2-3 seconds: 1 short sentence, roughly 8-15 words. Never output a multi-sentence paragraph.

HOW TO BUILD EACH HOOK:
1. Find whichever reference — a scored Arabic hook's structure, or a template's underlying idea — best fits the new script's content.
2. Study what makes it work: usually a clear before/after or ordinary→surprising gap (contrast), immediate who/what (context), hard numbers instead of vague claims (specificity), a fast proof signal (proof).
3. Write ONE short Arabic/Shami sentence that follows that same underlying logic, filled in with real specifics pulled from the NEW script — composed the way a native speaker would actually say it out loud. Never translate a template's English wording literally; only borrow its idea.

GROUNDING: report templateIndex and/or hookIndex — the number(s) of whichever reference(s) actually inspired this suggestion (numbers must correspond to real items in the lists, never invented). It's fine to lean on just one of the two lists for a given suggestion.

DO NOT:
- Copy a scored hook's wording verbatim, or translate a template's English sentence word-for-word
- Write more than one sentence / more than ~15 words
- Write vague hooks with no number or concrete detail when the script has numbers available

Each of the 3 suggestions must take a different structural approach so they're genuinely different options, not 3 rewordings of the same idea.

Return JSON: {"suggestions": [{"hook": "...", "skipRatePrediction": 0-100, "templateIndex": 1, "hookIndex": 1, "principle": "which lever this strengthens"}]}`;

async function callClaude(system: string, userContent: string, maxTokens: number) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userContent }],
      thinking: {
        type: "disabled",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Anthropic HTTP error:", response.status, errText);
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json();

  // Handle Anthropic's error responses
  if (data.error) {
    throw new Error(`Anthropic error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  // Find the text content block (skipping thinking blocks)
  const textBlock = data.content?.find((block: { type: string; text?: string }) => block.type === "text");
  const text: string = textBlock?.text || "";

  if (!text.trim()) {
    throw new Error(
      `Anthropic returned no text. Content types: ${data.content?.map((c: { type: string }) => c.type).join(", ")}`
    );
  }

  // Strip a markdown fence if the model adds one anyway.
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON parse failed. Raw input (first 500 chars):", cleaned.substring(0, 500));
    console.error("Full error:", e instanceof Error ? e.message : String(e));
    throw new Error(`Failed to parse Claude's response: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function evaluateHook(hook: string): Promise<HookEvaluation> {
  const key = `eval:${hash(hook)}`;
  const cache = readCache();
  const cached = cache[key];
  if (cached && Date.now() - cached.fetchedAt < ONE_DAY_MS) {
    return cached.result as HookEvaluation;
  }

  const parsed = await callClaude(EVAL_SYSTEM, `Hook: "${hook}"`, 1200);

  const skipRatePrediction = Math.max(0, Math.min(100, Math.round(parsed.skipRatePrediction)));
  const result: HookEvaluation = {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    skipRatePrediction,
    retentionPrediction: 100 - skipRatePrediction,
    levers: parsed.levers,
    weakestLever: parsed.weakestLever,
    issues: parsed.issues ?? [],
    strengths: parsed.strengths ?? [],
    reasoning: parsed.reasoning ?? "",
  };

  cache[key] = { fetchedAt: Date.now(), result };
  writeCache(cache);
  return result;
}

export async function suggestHooks(
  hook: string,
  evaluation: HookEvaluation,
  coreIdea?: string,
  script?: string,
  description?: string
): Promise<HookSuggestion[]> {
  // If script or core idea is provided, bypass cache to force fresh generation
  const key = `suggest:${hash(hook)}${coreIdea ? `:core:${hash(coreIdea)}` : ""}${script ? `:script:${hash(script)}` : ""}`;
  const cache = readCache();
  const cached = cache[key];
  if (cached && Date.now() - cached.fetchedAt < ONE_DAY_MS && !coreIdea && !script) {
    return cached.result as HookSuggestion[];
  }

  // Sample once and keep the arrays — the same arrays are used to build the
  // numbered prompt AND to validate the indices Claude cites back, so what's
  // shown as "source" in the UI is looked up from these, never trusted from
  // the model's own claim.
  const referenceHooksArr = getTopScoringHooks(6, 55);
  const hookTemplatesArr = getHookTemplatesSample(8);

  const userMessage = `SCORED ARABIC HOOKS (numbered — real examples, match this register/proof style, don't copy the words):
${formatScoredHooksNumbered(referenceHooksArr)}

HOOK TEMPLATES (numbered, English — these are IDEAS for a hook's shape, not sentences to translate):
${formatHookTemplatesNumbered(hookTemplatesArr)}

NEW SCRIPT TO WRITE HOOKS FOR:
${script ? script : "(no script provided)"}

Current hook: "${hook}"
Current skip rate: ${evaluation.skipRatePrediction}%
Weakest lever: ${evaluation.weakestLever}
Issues: ${evaluation.issues.join("; ")}

Write 3 hooks, each taking a different structural approach inspired by the lists above — natural Arabic/Shami, one short sentence, real specifics from THIS script. Report which numbered item(s) inspired each one via templateIndex/hookIndex.${coreIdea ? `\n\nCORE IDEA TO PRESERVE: "${coreIdea}"` : ""}`;

  const parsed = await callClaude(
    SUGGEST_SYSTEM,
    userMessage,
    1800
  );

  const result: HookSuggestion[] = (parsed.suggestions ?? []).map(
    (s: {
      hook: string;
      skipRatePrediction: number;
      principle: string;
      templateIndex?: number;
      hookIndex?: number;
    }) => {
      // 1-based indices from the model; validate against the actual arrays
      // sent. An out-of-range or missing index means the claim is ungrounded
      // and we surface that as null rather than fabricating a source. These
      // are inspiration sources, not something the hook must translate, so
      // there's no structural pass/fail check here — just honest provenance.
      const template = s.templateIndex ? hookTemplatesArr[s.templateIndex - 1] : undefined;
      const sourceHookObj = s.hookIndex ? referenceHooksArr[s.hookIndex - 1] : undefined;

      return {
        hook: s.hook,
        skipRatePrediction: Math.max(0, Math.min(100, Math.round(s.skipRatePrediction))),
        principle: s.principle,
        sourceTemplate: template ? { category: template.category, template: template.template } : null,
        sourceHook: sourceHookObj ? { hook: sourceHookObj.hook, score: sourceHookObj.score } : null,
      };
    }
  );

  cache[key] = { fetchedAt: Date.now(), result };
  writeCache(cache);
  return result;
}
