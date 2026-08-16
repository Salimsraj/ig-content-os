"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ScrollText,
  Calendar,
  Image,
  Users,
  Sparkles,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "نظرة عامة", url: "/", icon: LayoutGrid },
  { title: "مكتبة السكريبتات", url: "/scripts", icon: ScrollText },
  { title: "المحتوى", url: "/content", icon: Image },
  { title: "التقويم", url: "/calendar", icon: Calendar },
  { title: "Creators", url: "/competitors", icon: Users },
  { title: "مصادر إلهام", url: "/inspiration", icon: Sparkles },
  { title: "الإعدادات", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        <span className="text-lg font-bold text-foreground">لوحة المحتوى</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      size="lg"
                      isActive={isActive}
                      className={
                        isActive
                          ? "bg-blue-50 font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                          : "text-muted-foreground hover:bg-muted"
                      }
                      render={<Link href={item.url} />}
                    >
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
