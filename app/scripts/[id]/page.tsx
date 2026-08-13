import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { ScriptForm } from "@/components/script-form";
import { getScript } from "@/lib/scripts";

export const dynamic = "force-dynamic";

export default async function ScriptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const script = await getScript(id);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-xl font-bold text-foreground">{script.name || "سكريبت"}</h1>
      </div>

      <Card className="max-w-3xl shadow-sm">
        <CardContent>
          <ScriptForm
            id={script.id}
            initialName={script.name}
            initialTags={script.tags}
            initialBody={script.body}
          />
        </CardContent>
      </Card>
    </div>
  );
}
