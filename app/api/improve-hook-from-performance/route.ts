import { evaluateHook, suggestHooks } from "@/lib/hook-evaluator";

// Post-posting: given a reel's ACTUAL skip rate, explain what went wrong in the
// hook and give rewrites to use next time.
export async function POST(request: Request) {
  try {
    const { hook, skipRate } = await request.json();

    if (!hook || typeof hook !== "string" || !hook.trim()) {
      return Response.json({ error: "Hook text is required" }, { status: 400 });
    }
    if (typeof skipRate !== "number") {
      return Response.json({ error: "skipRate (number) is required" }, { status: 400 });
    }

    const trimmed = hook.trim();
    const evaluation = await evaluateHook(trimmed);
    const suggestions = await suggestHooks(trimmed, evaluation);

    return Response.json({
      originalHook: trimmed,
      actualSkipRate: skipRate,
      predictedSkipRate: evaluation.skipRatePrediction,
      weakestLever: evaluation.weakestLever,
      issues: evaluation.issues,
      reasoning: evaluation.reasoning,
      suggestions,
    });
  } catch (error) {
    console.error("Error improving hook from performance:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to analyse hook" },
      { status: 500 }
    );
  }
}
