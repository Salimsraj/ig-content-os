import { evaluateHook } from "@/lib/hook-evaluator";

export async function POST(request: Request) {
  try {
    const { script, hook } = await request.json();

    if (!script || typeof script !== "string") {
      return Response.json({ error: "Script is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 500,
        thinking: {
          type: "disabled",
        },
        system: `Create 3 short, clear Arabic/Shami video overlay titles (3-7 words) from the script.

CRITICAL: Write ONLY in Arabic/Shami. NEVER use English.

Each title must: show a specific BENEFIT (not tool), be immediately understandable, and emphasize a different angle. Use concrete numbers/results, not generic words.

EXAMPLES OF GOOD TITLES (Arabic only):
- "وفر 5 ساعات من وقتك يومياً"
- "انجز شغل أسبوع في يوم واحد"
- "شغل أقل، نتايج أكتر"

Return JSON: {"titles": ["title 1", "title 2", "title 3"]}`,
        messages: [
          {
            role: "user",
            content: `Script: ${script}\n\nCreate 3 different hooky titles for a video overlay (first 3 seconds). Each angle should highlight a different benefit frame, but all about the same core value.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.content || data.content.length === 0) {
      console.error("No content in response:", data);
      return Response.json({ error: "Empty API response" }, { status: 500 });
    }

    const textBlock = data.content.find((b: { type: string }) => b.type === "text");
    const text = textBlock?.text?.trim() || "";

    if (!text) {
      console.error("No text block found. Content types:", data.content.map((c: { type: string }) => c.type));
      return Response.json({ error: "Failed to generate titles (no text response)" }, { status: 500 });
    }

    try {
      const parsed = JSON.parse(text);
      if (parsed.titles && Array.isArray(parsed.titles) && parsed.titles.length === 3) {
        return Response.json({ titles: parsed.titles });
      }
    } catch {
      // Fallback: try to extract 3 lines that look like titles
      const lines = text.split("\n").filter((l: string) => l.trim().length > 5).slice(0, 3);
      if (lines.length === 3) {
        return Response.json({ titles: lines.map((l: string) => l.replace(/^[0-9.\-*•]\s*/, "").trim()) });
      }
    }

    return Response.json({ error: "Failed to parse titles" }, { status: 500 });
  } catch (error) {
    console.error("Error generating hooky titles:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate titles" },
      { status: 500 }
    );
  }
}
