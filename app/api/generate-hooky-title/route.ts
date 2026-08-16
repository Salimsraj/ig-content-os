import { callClaudeText } from "@/lib/claude-client";

export async function POST(request: Request) {
  try {
    const { script } = await request.json();

    if (!script || typeof script !== "string") {
      return Response.json({ error: "Script is required" }, { status: 400 });
    }

    const system = `Create 3 short, clear Arabic/Shami video overlay titles (3-7 words) from the script.

CRITICAL: Write ONLY in Arabic/Shami. NEVER use English.

Each title must: show a specific BENEFIT (not tool), be immediately understandable, and emphasize a different angle. Use concrete numbers/results, not generic words.

EXAMPLES OF GOOD TITLES (Arabic only):
- "وفر 5 ساعات من وقتك يومياً"
- "انجز شغل أسبوع في يوم واحد"
- "شغل أقل، نتايج أكتر"

Return JSON: {"titles": ["title 1", "title 2", "title 3"]}`;

    const userContent = `Script: ${script}\n\nCreate 3 different hooky titles for a video overlay (first 3 seconds). Each angle should highlight a different benefit frame, but all about the same core value.`;

    const text = await callClaudeText(system, userContent, 500);

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
