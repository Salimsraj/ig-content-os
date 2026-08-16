// Shared low-level Claude call, extracted from three near-identical copies
// found across lib/hook-evaluator.ts, lib/hook-rewriter.ts, and
// app/api/generate-hooky-title/route.ts (Phase 2 audit). Each caller had
// slightly different error/caching/fallback semantics wrapped around the
// same request-building + response-parsing mechanics, so only that shared
// mechanical part is extracted here — callers keep their own JSON.parse and
// error-handling strategy on top of it.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

export class ClaudeCallError extends Error {}

/**
 * Sends a system+user message to Claude with thinking disabled, and returns
 * the cleaned text content (skipping any thinking blocks, stripping a
 * markdown fence if the model adds one despite being asked for raw JSON).
 * Throws ClaudeCallError on any failure — callers decide how to handle that
 * (let it propagate, catch and return null, etc).
 */
export async function callClaudeText(
  system: string,
  userContent: string,
  maxTokens: number
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new ClaudeCallError("ANTHROPIC_API_KEY is not set");

  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
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
    throw new ClaudeCallError(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new ClaudeCallError(`Anthropic error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  const textBlock = data.content?.find((block: { type: string; text?: string }) => block.type === "text");
  const text: string = textBlock?.text || "";

  if (!text.trim()) {
    throw new ClaudeCallError(
      `Anthropic returned no text. Content types: ${data.content?.map((c: { type: string }) => c.type).join(", ")}`
    );
  }

  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

/** Convenience wrapper for callers that want parsed JSON and are fine throwing on a parse failure. */
export async function callClaudeJSON(
  system: string,
  userContent: string,
  maxTokens: number
): Promise<unknown> {
  const text = await callClaudeText(system, userContent, maxTokens);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new ClaudeCallError(
      `Failed to parse Claude's response as JSON: ${e instanceof Error ? e.message : String(e)}. Raw (first 500 chars): ${text.slice(0, 500)}`
    );
  }
}
