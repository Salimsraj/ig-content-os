import { evaluateHook, suggestHooks } from "@/lib/hook-evaluator";

export async function POST(request: Request) {
  try {
    const { hook, coreIdea, script, description } = await request.json();

    if (!hook || typeof hook !== "string" || !hook.trim()) {
      return Response.json({ error: "Hook text is required" }, { status: 400 });
    }

    const trimmed = hook.trim();
    const evaluation = await evaluateHook(trimmed);
    const suggestions = await suggestHooks(trimmed, evaluation, coreIdea, script, description);

    return Response.json({
      originalHook: trimmed,
      originalScore: evaluation.score,
      originalSkipRate: evaluation.skipRatePrediction,
      weakestLever: evaluation.weakestLever,
      suggestions: suggestions.map((s) => ({
        ...s,
        improvement: evaluation.skipRatePrediction - s.skipRatePrediction,
      })),
    });
  } catch (error) {
    console.error("Error regenerating hook:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to regenerate hook" },
      { status: 500 }
    );
  }
}
