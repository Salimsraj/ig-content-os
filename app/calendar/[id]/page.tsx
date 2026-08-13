import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarItemForm } from "@/components/calendar-item-form";
import { getPage, getBlockChildren, blockToText } from "@/lib/notion";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function richTextToPlain(richText: any[] | undefined): string {
  return (richText ?? []).map((t) => t.plain_text).join("");
}

async function getCalendarItem(id: string) {
  const [page, blocks] = await Promise.all([getPage(id), getBlockChildren(id)]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = (page as any).properties ?? {};

  return {
    id,
    title: richTextToPlain(props["Video Title"]?.title) || "Untitled",
    caption: richTextToPlain(props["Caption"]?.rich_text),
    description: richTextToPlain(props["Description"]?.rich_text),
    status: props["Status"]?.status?.name || "Idea",
    date: props["Post Date"]?.date?.start || null,
    type: props["Type"]?.select?.name || "Post",
    body: blocks.map(blockToText).join("\n"),
  };
}

export default async function CalendarItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getCalendarItem(id);

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 bg-white min-h-screen" dir="auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Link href="/calendar" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
            <ArrowRight className="size-4" />
            Calendar
          </Link>
        </div>
        <a
          href={`https://notion.so/${id.replace(/-/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          Open in Notion
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="secondary">{item.status}</Badge>
          <p className="text-sm text-gray-500">
            {item.type}
            {item.date &&
              ` · ${new Date(item.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`}
          </p>
        </div>

        <Card className="border border-gray-200 shadow-sm bg-white mt-4">
          <CardContent className="p-5">
            <CalendarItemForm
              id={item.id}
              initialTitle={item.title}
              initialDescription={item.description}
              initialCaption={item.caption}
              initialBody={item.body}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
