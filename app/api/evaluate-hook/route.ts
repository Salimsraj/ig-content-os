import { evaluateHook } from "@/lib/hook-evaluator";

export async function POST(request: Request) {
  try {
    const { hook } = await request.json();

    if (!hook || typeof hook !== "string" || !hook.trim()) {
      return Response.json({ error: "Hook text is required" }, { status: 400 });
    }

    const evaluation = await evaluateHook(hook.trim());
    return Response.json({ hook, evaluation });
  } catch (error) {
    console.error("Error evaluating hook:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to evaluate hook" },
      { status: 500 }
    );
  }
}
