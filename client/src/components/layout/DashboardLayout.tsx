"use client"

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, Ticket, LogOut, Settings, BarChart3, Users, QrCode, Tag, MessageSquare, Bell, CreditCard } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ["ADMIN", "ORGANIZER", "ATTENDEE"] },
    { name: "My Events", icon: CalendarDays, href: "/dashboard/events", roles: ["ORGANIZER", "ADMIN"] },
    { name: "Registrations", icon: Users, href: "/dashboard/registrations", roles: ["ORGANIZER"] },
    { name: "My Tickets", icon: Ticket, href: "/dashboard/tickets", roles: ["ATTENDEE"] },
    { name: "Payments", icon: CreditCard, href: "/dashboard/payments", roles: ["ATTENDEE"] },
    { name: "Check-in", icon: QrCode, href: "/dashboard/checkin", roles: ["ORGANIZER"] },
    { name: "Marketing", icon: Tag, href: "/dashboard/marketing", roles: ["ORGANIZER", "ADMIN"] },
    { name: "Engagement", icon: MessageSquare, href: "/dashboard/engagement", roles: ["ORGANIZER"] },
    { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics", roles: ["ORGANIZER", "ADMIN"] },
    { name: "Notifications", icon: Bell, href: "/dashboard/notifications", roles: ["ADMIN", "ORGANIZER", "ATTENDEE"] },
    { name: "Users", icon: Users, href: "/dashboard/users", roles: ["ADMIN"] },
    { name: "Settings", icon: Settings, href: "/dashboard/settings", roles: ["ADMIN", "ORGANIZER", "ATTENDEE"] },
  ];

  const visibleMenuItems = menuItems.filter((item) => user && item.roles.includes(user.role));

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-md hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white text-xs font-bold">EP</span>
            </div>
            EventPro
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400 shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-indigo-900/50 text-indigo-200">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.role}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border bg-card/30 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-lg font-semibold tracking-tight">
            {visibleMenuItems.find((m) => pathname === m.href || pathname.startsWith(`${m.href}/`))?.name || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/events" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Discover Events
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
