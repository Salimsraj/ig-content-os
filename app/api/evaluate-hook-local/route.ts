import { evaluateHook } from "@/lib/hook-evaluator-local";

export async function POST(request: Request) {
  try {
    const { hook } = await request.json();

    if (!hook || typeof hook !== "string" || !hook.trim()) {
      return Response.json({ error: "Hook text is required" }, { status: 400 });
    }

    const evaluation = evaluateHook(hook.trim());
    return Response.json({ hook, evaluation, source: "local" });
  } catch (error) {
    console.error("Error in local evaluator:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to evaluate hook" },
      { status: 500 }
    );
  }
}
