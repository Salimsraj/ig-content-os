import {
  queryDatabase,
  getPage,
  createPage,
  updatePage,
  getBlockChildren,
  appendBlockChildren,
  deleteBlock,
} from "@/lib/notion";

const SCRIPTS_DB_ID = process.env.NOTION_SCRIPTS_DB_ID!;

export type ScriptSummary = { id: string; name: string; tags: string[] };
export type Script = ScriptSummary & { body: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTitle(page: any): string {
  return (page.properties?.Name?.title ?? [])
    .map((t: { plain_text: string }) => t.plain_text)
    .join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTags(page: any): string[] {
  return (page.properties?.Tags?.multi_select ?? []).map(
    (t: { name: string }) => t.name
  );
}

function richText(content: string) {
  return content ? [{ type: "text" as const, text: { content } }] : [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blockToLine(block: any): string {
  const richTextArray = block[block.type]?.rich_text ?? [];
  const text = richTextArray
    .map((t: { plain_text: string }) => t.plain_text)
    .join("");
  if (block.type === "heading_2") return `## ${text}`;
  if (block.type === "heading_3") return `### ${text}`;
  return text;
}

function lineToBlock(line: string) {
  if (line.startsWith("### ")) {
    const text = line.slice(4);
    return { object: "block" as const, type: "heading_3" as const, heading_3: { rich_text: richText(text) } };
  }
  if (line.startsWith("## ")) {
    const text = line.slice(3);
    return { object: "block" as const, type: "heading_2" as const, heading_2: { rich_text: richText(text) } };
  }
  return { object: "block" as const, type: "paragraph" as const, paragraph: { rich_text: richText(line) } };
}

export async function listScripts(): Promise<ScriptSummary[]> {
  const pages = await queryDatabase(SCRIPTS_DB_ID);
  return pages
    .map((page) => ({
      id: page.id,
      name: extractTitle(page),
      tags: extractTags(page),
    }))
    .filter((script) => script.name.trim().length > 0);
}

export async function getScript(id: string): Promise<Script> {
  const [page, blocks] = await Promise.all([
    getPage(id),
    getBlockChildren(id),
  ]);

  return {
    id,
    name: extractTitle(page),
    tags: extractTags(page),
    body: blocks.map(blockToLine).join("\n"),
  };
}

export async function createScript(input: {
  name: string;
  tags: string[];
  body: string;
}): Promise<string> {
  const page = await createPage(SCRIPTS_DB_ID, {
    Name: { title: richText(input.name) },
    Tags: { multi_select: input.tags.map((name) => ({ name })) },
  });
  if (input.body.trim()) {
    await appendBlockChildren(page.id, input.body.split("\n").map(lineToBlock));
  }
  return page.id;
}

export async function updateScript(
  id: string,
  input: { name: string; tags: string[]; body: string }
): Promise<void> {
  await updatePage(id, {
    Name: { title: richText(input.name) },
    Tags: { multi_select: input.tags.map((name) => ({ name })) },
  });

  const existingBlocks = await getBlockChildren(id);
  await Promise.all(existingBlocks.map((block) => deleteBlock(block.id)));

  if (input.body.trim()) {
    await appendBlockChildren(id, input.body.split("\n").map(lineToBlock));
  }
}
