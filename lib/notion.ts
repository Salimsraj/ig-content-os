import { Client } from "@notionhq/client";

// Without an explicit fetch, the SDK falls back to its bundled node-fetch@2,
// which uses the legacy (deprecated, DEP0169) url.parse() internally on
// every request. Node's native fetch (global since Node 18) uses the
// WHATWG URL API instead, so passing it here removes the warning entirely.
const notion = new Client({ auth: process.env.NOTION_API_KEY!, fetch });

export async function queryDatabase(
  databaseId: string,
  filter?: Parameters<typeof notion.databases.query>[0]["filter"]
) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter,
  });
  return response.results;
}

export async function getPage(pageId: string) {
  return notion.pages.retrieve({ page_id: pageId });
}

export async function createPage(
  databaseId: string,
  properties: Parameters<typeof notion.pages.create>[0]["properties"]
) {
  return notion.pages.create({
    parent: { database_id: databaseId },
    properties,
  });
}

export async function updatePage(
  pageId: string,
  properties: Parameters<typeof notion.pages.update>[0]["properties"]
) {
  return notion.pages.update({
    page_id: pageId,
    properties,
  });
}

export async function getBlockChildren(blockId: string) {
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 100,
  });
  return response.results;
}

export async function appendBlockChildren(
  blockId: string,
  children: Parameters<typeof notion.blocks.children.append>[0]["children"]
) {
  return notion.blocks.children.append({ block_id: blockId, children });
}

export async function deleteBlock(blockId: string) {
  return notion.blocks.delete({ block_id: blockId });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function blockToText(block: any): string {
  const type = block.type;
  const richTextArray = block[type]?.rich_text ?? [];
  const text = richTextArray
    .map((t: { plain_text: string }) => t.plain_text)
    .join("");
  switch (type) {
    case "heading_1":
      return `# ${text}`;
    case "heading_2":
      return `## ${text}`;
    case "heading_3":
      return `### ${text}`;
    case "bulleted_list_item":
      return `• ${text}`;
    case "numbered_list_item":
      return `- ${text}`;
    case "quote":
      return `> ${text}`;
    case "divider":
      return "---";
    default:
      return text;
  }
}

function richText(content: string) {
  return content ? [{ type: "text" as const, text: { content } }] : [];
}

export function lineToBlock(line: string) {
  if (line.startsWith("### ")) {
    return { object: "block" as const, type: "heading_3" as const, heading_3: { rich_text: richText(line.slice(4)) } };
  }
  if (line.startsWith("## ")) {
    return { object: "block" as const, type: "heading_2" as const, heading_2: { rich_text: richText(line.slice(3)) } };
  }
  if (line.startsWith("# ")) {
    return { object: "block" as const, type: "heading_1" as const, heading_1: { rich_text: richText(line.slice(2)) } };
  }
  if (line.startsWith("• ")) {
    return { object: "block" as const, type: "bulleted_list_item" as const, bulleted_list_item: { rich_text: richText(line.slice(2)) } };
  }
  if (line.startsWith("> ")) {
    return { object: "block" as const, type: "quote" as const, quote: { rich_text: richText(line.slice(2)) } };
  }
  if (line === "---") {
    return { object: "block" as const, type: "divider" as const, divider: {} };
  }
  return { object: "block" as const, type: "paragraph" as const, paragraph: { rich_text: richText(line) } };
}
