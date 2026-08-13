"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  updatePage,
  getBlockChildren,
  appendBlockChildren,
  deleteBlock,
  lineToBlock,
} from "@/lib/notion";

function richText(content: string) {
  return content ? [{ type: "text" as const, text: { content } }] : [];
}

export async function updateCalendarItemAction(formData: FormData) {
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const caption = (formData.get("caption") as string) ?? "";
  const body = (formData.get("body") as string) ?? "";

  await updatePage(id, {
    "Video Title": { title: richText(title) },
    Description: { rich_text: richText(description) },
    Caption: { rich_text: richText(caption) },
  });

  const existingBlocks = await getBlockChildren(id);
  await Promise.all(existingBlocks.map((block) => deleteBlock(block.id)));

  if (body.trim()) {
    await appendBlockChildren(
      id,
      body.split("\n").map(lineToBlock)
    );
  }

  revalidatePath(`/calendar/${id}`);
  revalidatePath("/calendar");
  redirect(`/calendar/${id}`);
}
