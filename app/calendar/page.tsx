import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface CalendarItem {
  id: string;
  title: string;
  date: string;
  status?: string;
  type?: string;
}

async function getContentItems() {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_IDEAS_DB_ID || "5b6d77be-610c-8263-8018-81426b57b4f4";

  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: 100,
        }),
      }
    );

    const data = await response.json();

    if (!data.results) return [];

    return data.results.map((item: any) => ({
      id: item.id,
      title: item.properties?.["Video Title"]?.title?.[0]?.plain_text || "Untitled",
      date: item.properties?.["Post Date"]?.date?.start || null,
      status: item.properties?.Status?.status?.name || "Idea",
      type: item.properties?.Type?.select?.name || "Post",
    })).filter((item: CalendarItem) => item.date);
  } catch (error) {
    console.error("Failed to fetch calendar items:", error);
    return [];
  }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getItemsForDate(items: CalendarItem[], year: number, month: number, day: number) {
  return items.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getFullYear() === year &&
      itemDate.getMonth() === month &&
      itemDate.getDate() === day
    );
  });
}

function getStatusColor(status?: string) {
  switch (status) {
    case "Posted":
      return "bg-green-100 text-green-800 border-green-300";
    case "Scheduled":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "To Edit":
      return "bg-pink-100 text-pink-800 border-pink-300";
    case "To Film":
      return "bg-red-100 text-red-800 border-red-300";
    case "Scripting":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "Archived":
      return "bg-gray-100 text-gray-500 border-gray-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const today = new Date();
  const year = params.year ? parseInt(params.year, 10) : today.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : today.getMonth();

  const items = await getContentItems();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Create calendar grid
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-semibold text-black">Calendar</h1>
            <p className="text-sm text-gray-500 mt-1">Synced with Notion</p>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {monthNames[month]} {year}
        </div>
      </div>

      {/* Calendar Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-black">
                  {monthNames[month]} {year}
                  {isCurrentMonth && (
                    <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Today</span>
                  )}
                </h2>
                <div className="flex gap-1">
                  <Link
                    href={`/calendar?year=${prevYear}&month=${prevMonth}`}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="size-5 text-gray-700" />
                  </Link>
                  <Link
                    href={`/calendar?year=${nextYear}&month=${nextMonth}`}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronRight className="size-5 text-gray-700" />
                  </Link>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-0 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wide py-3 border-b border-gray-200">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {days.map((day, index) => {
                  const dayItems = day ? getItemsForDate(items, year, month, day) : [];
                  const isToday = isCurrentMonth && day === today.getDate();

                  return (
                    <div
                      key={index}
                      className={`min-h-32 p-3 border-r border-b border-gray-200 ${
                        day
                          ? isToday
                            ? "bg-blue-50"
                            : "bg-white hover:bg-gray-50"
                          : "bg-gray-50"
                      } ${index % 7 === 6 ? "border-r-0" : ""} ${
                        Math.floor((index + 1) / 7) === Math.ceil(days.length / 7) - 1 ? "border-b-0" : ""
                      }`}
                    >
                      {day && (
                        <div className="flex flex-col h-full">
                          <div className={`text-sm font-semibold mb-2 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                            {day}
                          </div>
                          <div className="space-y-1 flex-1">
                            {dayItems.slice(0, 3).map((item) => (
                              <Link
                                key={item.id}
                                href={`/calendar/${item.id}`}
                                className={`block text-xs p-1.5 rounded border truncate cursor-pointer hover:shadow-sm transition-all ${getStatusColor(
                                  item.status
                                )}`}
                              >
                                {item.title}
                              </Link>
                            ))}
                            {dayItems.length > 3 && (
                              <div className="text-xs text-gray-600 pl-1.5 pt-1">
                                +{dayItems.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Status Legend</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-sm text-gray-700">Posted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                    <span className="text-sm text-gray-700">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-100 border border-pink-300 rounded"></div>
                    <span className="text-sm text-gray-700">To Edit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                    <span className="text-sm text-gray-700">To Film</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                    <span className="text-sm text-gray-700">Scripting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                    <span className="text-sm text-gray-700">Archived</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Stats & Summary */}
        <div className="lg:col-span-1">
          <Card className="border border-gray-200 shadow-sm bg-white sticky top-8">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-6">Summary</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Total Scheduled Posts</p>
                  <p className="text-3xl font-bold text-black">{items.length}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-3">By Status</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Posted</span>
                      <span className="text-sm font-semibold text-green-700">
                        {items.filter((i: CalendarItem) => i.status === "Posted").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Scheduled</span>
                      <span className="text-sm font-semibold text-yellow-700">
                        {items.filter((i: CalendarItem) => i.status === "Scheduled").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">To Edit</span>
                      <span className="text-sm font-semibold text-pink-700">
                        {items.filter((i: CalendarItem) => i.status === "To Edit").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">To Film</span>
                      <span className="text-sm font-semibold text-red-700">
                        {items.filter((i: CalendarItem) => i.status === "To Film").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Archived</span>
                      <span className="text-sm font-semibold text-gray-500">
                        {items.filter((i: CalendarItem) => i.status === "Archived").length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-3">Next 5 Posts</p>
                  <div className="space-y-2">
                    {items
                      .filter((item: CalendarItem) => item.date && new Date(item.date).getTime() >= new Date(today.toDateString()).getTime())
                      .sort((a: CalendarItem, b: CalendarItem) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .slice(0, 5)
                      .map((item: CalendarItem) => (
                        <Link
                          key={item.id}
                          href={`/calendar/${item.id}`}
                          className="block group"
                        >
                          <p className="text-xs text-gray-900 group-hover:text-blue-600 truncate font-medium">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
