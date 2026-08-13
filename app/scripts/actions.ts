"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createScript, updateScript } from "@/lib/scripts";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function saveScriptAction(formData: FormData) {
  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string) ?? "";
  const tags = parseTags((formData.get("tags") as string) ?? "");
  const body = (formData.get("body") as string) ?? "";

  if (id) {
    await updateScript(id, { name, tags, body });
    revalidatePath(`/scripts/${id}`);
    revalidatePath("/scripts");
    redirect(`/scripts/${id}`);
  } else {
    const newId = await createScript({ name, tags, body });
    revalidatePath("/scripts");
    redirect(`/scripts/${newId}`);
  }
}
