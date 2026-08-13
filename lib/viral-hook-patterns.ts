import fs from "fs";
import path from "path";

const VIRAL_HOOK_ANALYSIS_FILE = path.join(process.cwd(), "data", "viral-hook-analysis.json");

export type ScoredHook = {
  id: string;
  account: string;
  hook: string;
  score: number;
  skipRatePrediction: number;
  weakestLever: string;
  levers: { contrast: number; context: number; specificity: number; proof: number; register: number };
};

function readScoredHooks(): ScoredHook[] {
  try {
    const raw = JSON.parse(fs.readFileSync(VIRAL_HOOK_ANALYSIS_FILE, "utf-8")) as unknown[];
    return raw.filter((h): h is ScoredHook => typeof h === "object" && h !== null && "score" in h);
  } catch {
    return [];
  }
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Pulls a fresh, randomized sample of proven high-scoring hooks straight from
 * data/viral-hook-analysis.json (scored by the same 5-lever framework used to
 * evaluate hooks). New hooks added to that file automatically become eligible
 * reference examples — nothing here is hardcoded, so this stays current as
 * the dataset grows.
 */
export function getTopScoringHooks(count = 6, minScore = 55): ScoredHook[] {
  const scored = readScoredHooks()
    .filter((h) => h.score >= minScore)
    .sort((a, b) => b.score - a.score);

  // Sample from the top pool (2x the requested count) so repeated calls vary
  // instead of always returning the identical set.
  const pool = scored.slice(0, Math.max(count * 3, 15));
  return shuffle(pool).slice(0, count);
}

// Numbered so the model can cite an exact index instead of paraphrasing —
// the index is then validated in code against this same array, closing the
// loop between what was actually offered and what the model claims it used.
export function formatScoredHooksNumbered(hooks: ScoredHook[]): string {
  if (hooks.length === 0) return "No scored reference hooks available yet.";
  return hooks
    .map(
      (h, i) =>
        `${i + 1}. (score ${h.score}/100, strong on: ${strongestLevers(h.levers)}) "${truncateToOpeningBeat(h.hook)}"`
    )
    .join("\n");
}

// Reference hooks in the dataset are transcript excerpts, not clean single
// sentences. Cut to the first sentence-ish chunk so the model sees roughly
// the length a real hook should be, instead of anchoring on a full paragraph.
function truncateToOpeningBeat(hookText: string, maxWords = 20): string {
  const words = hookText.trim().split(/\s+/);
  if (words.length <= maxWords) return hookText.trim();
  return words.slice(0, maxWords).join(" ") + "…";
}

function strongestLevers(levers: ScoredHook["levers"]): string {
  return Object.entries(levers)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([lever]) => lever)
    .join(", ");
}

const HOOK_TEMPLATES_FILE = path.join(process.cwd(), "data", "hook-templates.json");

export type HookTemplate = { category: string; template: string };

function readHookTemplates(): HookTemplate[] {
  try {
    const raw = JSON.parse(fs.readFileSync(HOOK_TEMPLATES_FILE, "utf-8")) as { templates: HookTemplate[] };
    return raw.templates || [];
  } catch {
    return [];
  }
}

/**
 * Fill-in-the-blank hook STRUCTURE templates (from "1,000 Viral Hooks", English,
 * organized by category: EDUCATIONAL, COMPARISON, MYTH BUSTING, STORYTELLING,
 * AUTHORITY, DAY IN THE LIFE). These are structural formulas, not hooks to
 * translate literally — pick the ones whose logic fits the script, then write
 * the final hook in natural Arabic/Shami filled with real script specifics.
 * Sampled fresh + randomized each call, same as the scored hooks, so this
 * stays current as more templates get added to data/hook-templates.json.
 */
export function getHookTemplatesSample(count = 8): HookTemplate[] {
  const all = readHookTemplates();
  if (all.length === 0) return [];

  // Spread the sample across categories instead of letting the biggest
  // category (EDUCATIONAL/STORYTELLING) dominate every call.
  const byCategory = new Map<string, HookTemplate[]>();
  for (const t of all) {
    if (!byCategory.has(t.category)) byCategory.set(t.category, []);
    byCategory.get(t.category)!.push(t);
  }
  const categories = shuffle([...byCategory.keys()]);
  const perCategory = Math.max(1, Math.ceil(count / categories.length));

  const sample: HookTemplate[] = [];
  for (const cat of categories) {
    const picks = shuffle(byCategory.get(cat)!).slice(0, perCategory);
    sample.push(...picks);
    if (sample.length >= count) break;
  }
  return shuffle(sample).slice(0, count);
}

// Numbered for the same reason as formatScoredHooksNumbered — the model
// cites an index, code looks up the real text, nothing is trusted verbatim.
export function formatHookTemplatesNumbered(templates: HookTemplate[]): string {
  if (templates.length === 0) return "No hook templates available yet.";
  return templates.map((t, i) => `${i + 1}. [${t.category}] "${t.template}"`).join("\n");
}
