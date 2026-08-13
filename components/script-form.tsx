import { saveScriptAction } from "@/app/scripts/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ScriptForm({
  id,
  initialName = "",
  initialTags = [],
  initialBody = "",
}: {
  id?: string;
  initialName?: string;
  initialTags?: string[];
  initialBody?: string;
}) {
  return (
    <form action={saveScriptAction} className="flex flex-col gap-5">
      {id && <input type="hidden" name="id" value={id} />}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">الاسم</Label>
        <Input id="name" name="name" defaultValue={initialName} dir="auto" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tags">الوسوم (Tags) — مفصولة بفاصلة</Label>
        <Input id="tags" name="tags" defaultValue={initialTags.join(", ")} dir="auto" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="body">نص السكريبت</Label>
        <Textarea
          id="body"
          name="body"
          defaultValue={initialBody}
          dir="auto"
          rows={18}
          className="font-mono leading-relaxed"
        />
        <p className="text-xs text-muted-foreground">
          استخدم ## في بداية السطر لعنوان كبير، و ### لعنوان فرعي.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">حفظ</Button>
      </div>
    </form>
  );
}
