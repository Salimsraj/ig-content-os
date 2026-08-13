import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { ScriptForm } from "@/components/script-form";

export default function NewScriptPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-xl font-bold text-foreground">سكريبت جديد</h1>
      </div>

      <Card className="max-w-3xl shadow-sm">
        <CardContent>
          <ScriptForm />
        </CardContent>
      </Card>
    </div>
  );
}
