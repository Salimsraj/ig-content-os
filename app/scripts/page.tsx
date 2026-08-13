import Link from "next/link";
import { Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listScripts } from "@/lib/scripts";

export const dynamic = "force-dynamic";

export default async function ScriptsPage() {
  const scripts = await listScripts();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <h1 className="text-xl font-bold text-foreground">مكتبة السكريبتات</h1>
        </div>
        <Button render={<Link href="/scripts/new" />}>
          <Plus className="size-4" />
          سكريبت جديد
        </Button>
      </div>

      {scripts.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            لا توجد سكريبتات بعد.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scripts.map((script) => (
            <Link key={script.id} href={`/scripts/${script.id}`}>
              <Card className="h-full shadow-sm transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">{script.name}</CardTitle>
                </CardHeader>
                {script.tags.length > 0 && (
                  <CardContent className="flex flex-wrap gap-1.5">
                    {script.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
