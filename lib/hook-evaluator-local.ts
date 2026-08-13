// Local-only hook evaluation without external API calls.
// Uses heuristics and pattern matching to score hooks.

export const HIGH_SKIP = 50;
export const LOW_SKIP = 30;

export type HookEvaluation = {
  score: number;
  skipRatePrediction: number;
  retentionPrediction: number;
  levers: {
    contrast: number;
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

// Patterns that indicate strong hooks
const CONTRAST_PATTERNS = /\b(but|vs|without|instead|never|only|however|despite|actually|really|unlike|while|though|بس|لكن|مش)\b/i;
const CONTEXT_INDICATORS = /^(إذا|لو|عندما|when|if|for)\b/i;
const SPECIFICITY_PATTERNS = /\d+|percent|%|مئة|ألف|thousand/i;
const PROOF_PATTERNS = /proved|showed|discovered|found|learned|spent|وجدت|اكتشفت|تعلمت|قضيت/i;
const GENERIC_HOOKS = /^(hey|so|listen|you won't|stop|start|don't|do this|try this|here's)/i;

function scoreLever(hook: string, type: "contrast" | "context" | "specificity" | "proof" | "register"): number {
  let score = 0;

  switch (type) {
    case "contrast":
      if (CONTRAST_PATTERNS.test(hook)) score += 5;
      if (hook.includes("→") || hook.includes("vs")) score += 3;
      if (/لا|ما/.test(hook) && /نعم|أيوه|بس/.test(hook)) score += 2;
      break;

    case "context":
      if (CONTEXT_INDICATORS.test(hook)) score += 5;
      // Check if first 5 words establish who/what
      const firstWords = hook.split(" ").slice(0, 5).join(" ");
      if (firstWords.length > 10 && !GENERIC_HOOKS.test(firstWords)) score += 4;
      break;

    case "specificity":
      if (SPECIFICITY_PATTERNS.test(hook)) score += 6;
      if (hook.length > 15 && !GENERIC_HOOKS.test(hook)) score += 3;
      if (/clay|anthropic|claude|tool|framework|system/i.test(hook)) score += 2;
      break;

    case "proof":
      if (PROOF_PATTERNS.test(hook)) score += 7;
      if (/\$|cost|expense|free|gratis/i.test(hook)) score += 3;
      break;

    case "register":
      // Code-switching is normal for Arabic/English audience, don't penalize
      // Check for overly formal or marketing-speak
      if (/limited time|don't miss|exclusive|revolutionary/i.test(hook)) score -= 2;
      // Informal, conversational tone is good
      if (/wanna|gonna|kinda|طب|شنو|واااي/i.test(hook)) score += 3;
      break;
  }

  return Math.max(0, Math.min(10, Math.round(score)));
}

export function evaluateHook(hook: string): HookEvaluation {
  if (!hook || hook.trim().length === 0) {
    return {
      score: 0,
      skipRatePrediction: 100,
      retentionPrediction: 0,
      levers: { contrast: 0, context: 0, specificity: 0, proof: 0, register: 0 },
      weakestLever: "all",
      issues: ["Hook is empty"],
      strengths: [],
      reasoning: "Cannot evaluate an empty hook.",
    };
  }

  const levers = {
    contrast: scoreLever(hook, "contrast"),
    context: scoreLever(hook, "context"),
    specificity: scoreLever(hook, "specificity"),
    proof: scoreLever(hook, "proof"),
    register: scoreLever(hook, "register"),
  };

  // Calculate overall score: context and contrast are most important
  const score = Math.round((levers.context * 2 + levers.contrast * 2 + levers.specificity + levers.proof + levers.register) / 7);

  // Map score to skip rate
  let skipRatePrediction: number;
  if (score >= 9) skipRatePrediction = 10;
  else if (score >= 8) skipRatePrediction = 18;
  else if (score >= 7) skipRatePrediction = 25;
  else if (score >= 6) skipRatePrediction = 35;
  else if (score >= 5) skipRatePrediction = 45;
  else if (score >= 4) skipRatePrediction = 55;
  else if (score >= 3) skipRatePrediction = 65;
  else if (score >= 2) skipRatePrediction = 78;
  else skipRatePrediction = 90;

  // Identify weakest lever
  const leverEntries = Object.entries(levers) as Array<[keyof typeof levers, number]>;
  const weakestLever = leverEntries.reduce((a, b) => (a[1] < b[1] ? a : b))[0];

  // Generate issues
  const issues: string[] = [];
  if (levers.context < 4) issues.push("Hook lacks immediate context—viewers don't know what this is about");
  if (levers.contrast < 3) issues.push("No contrast or curiosity gap—why would anyone stop and watch?");
  if (levers.specificity < 3) issues.push("Too generic or vague—specific claims or numbers would help");
  if (levers.proof < 2) issues.push("No proof signal—a number or concrete result would close the loop");
  if (GENERIC_HOOKS.test(hook)) issues.push("Sounds like a hook—generic phrases trigger ad-skepticism");

  // Generate strengths
  const strengths: string[] = [];
  if (levers.context >= 6) strengths.push("Clear immediate context");
  if (levers.contrast >= 6) strengths.push("Good contrast or curiosity element");
  if (levers.specificity >= 6) strengths.push("Specific and concrete");
  if (levers.proof >= 5) strengths.push("Includes proof or evidence");
  if (hook.length < 100) strengths.push("Concise and punchy");

  // Generate reasoning
  const reasoning = skipRatePrediction < 30
    ? `This hook is strong: it has good contrast and context. Viewers have a clear reason to watch.`
    : skipRatePrediction < 50
      ? `This hook is decent but leaks viewers. The main issue is weak ${weakestLever}.`
      : `This hook will lose most viewers. It needs stronger contrast and immediate context to work.`;

  return {
    score,
    skipRatePrediction,
    retentionPrediction: 100 - skipRatePrediction,
    levers,
    weakestLever,
    issues: issues.slice(0, 3),
    strengths: strengths.slice(0, 3),
    reasoning,
  };
}

export function suggestHooks(hook: string, evaluation: HookEvaluation): Array<{ hook: string; skipRatePrediction: number; principle: string }> {
  const suggestions: Array<{ hook: string; skipRatePrediction: number; principle: string }> = [];

  const { weakestLever } = evaluation;

  // Suggestion 1: Add context/contrast
  const s1 = `إذا أنت ${hook.includes("بزنس") ? "بدأت بزنس جديد" : "تبي تنجح"} و ما عندك ${hook.includes("عميل") ? "عملاء" : "استراتيجية"}، استعمل Clay.`;
  suggestions.push({ hook: s1, skipRatePrediction: 28, principle: "Added immediate context with 'إذا' (if)" });

  // Suggestion 2: Add specificity/proof
  const s2 = `هاي الطريقة وديتني من صفر إلى 100 عميل في شهر واحد باستخدام Clay.`;
  suggestions.push({ hook: s2, skipRatePrediction: 22, principle: "Added specific number and timeframe" });

  // Suggestion 3: Build contrast
  const s3 = `الكل يقول استخدم LinkedIn، بس الفكرة الحقيقية هي Clay و أتمتة الـ outreach.`;
  suggestions.push({ hook: s3, skipRatePrediction: 18, principle: "Strong contrast: 'الكل يقول..., بس...'" });

  return suggestions;
}
