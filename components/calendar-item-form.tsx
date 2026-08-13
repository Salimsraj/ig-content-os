"use client";

import { useState } from "react";
import { updateCalendarItemAction } from "@/app/calendar/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HookEvaluator } from "@/components/hook-evaluator";
import { HookyTitleGenerator } from "@/components/hooky-title-generator";

export function CalendarItemForm({
  id,
  initialTitle,
  initialDescription,
  initialCaption,
  initialBody,
}: {
  id: string;
  initialTitle: string;
  initialDescription: string;
  initialCaption: string;
  initialBody: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [generatedTitle, setGeneratedTitle] = useState<string | null>(null);

  return (
    <form action={updateCalendarItemAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={id} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title (hook)</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          dir="auto"
          required
        />
        <HookEvaluator hook={title} script={body} onUseSuggestion={setTitle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Hook / Description</Label>
        <Textarea id="description" name="description" defaultValue={initialDescription} dir="auto" rows={3} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="body">Script</Label>
        <Textarea
          id="body"
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          dir="auto"
          rows={16}
          className="font-mono leading-relaxed"
        />
        <HookyTitleGenerator script={body} hook={title} onTitleGenerated={setGeneratedTitle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="caption">Caption</Label>
        <Textarea id="caption" name="caption" defaultValue={initialCaption} dir="auto" rows={4} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
