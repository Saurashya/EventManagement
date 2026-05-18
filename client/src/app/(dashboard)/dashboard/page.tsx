"use client"

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Ticket, Users, DollarSign, Clock, ArrowRight, Bell } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/users/dashboard-stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isOrganizer = user.role === "ORGANIZER" || user.role === "ADMIN";

  const statCards = isOrganizer
    ? [
        { title: "Total Events", value: stats?.organizedEvents || 0, icon: CalendarDays, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-500/20" },
        { title: "Total Registrations", value: stats?.registrations || 0, icon: Users, color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-500/20" },
        { title: "Revenue", value: `NPR ${Number(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" },
        { title: "Check-ins", value: stats?.checkIns || 0, icon: Ticket, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/20" },
      ]
    : [
        { title: "Registered Events", value: stats?.registrations || 0, icon: CalendarDays, color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-500/20" },
        { title: "Payments", value: stats?.payments || 0, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" },
        { title: "Unread Notifications", value: stats?.unreadNotifications || 0, icon: Bell, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-500/20" },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user.name.split(" ")[0]}!</h2>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your events today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-card/50 backdrop-blur-sm border-border/50 hover:${stat.border} transition-colors`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        {isOrganizer && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Registrations</CardTitle>
                <Link href="/dashboard/registrations" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentRegistrations.slice(0, 5).map((reg: any) => (
                      <div key={reg.id || Math.random()} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {reg.user?.name?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{reg.user?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground truncate">{reg.event?.title} • {reg.ticketTier?.name}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {reg.createdAt ? format(new Date(reg.createdAt), "MMM d") : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                    No recent registrations yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upcoming Events */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <Link href={isOrganizer ? "/dashboard/events" : "/events"} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {stats?.upcomingEvents && stats.upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingEvents.slice(0, 5).map((event: any) => (
                    <div key={event.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex flex-col items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <span className="text-[10px] font-bold uppercase leading-none">
                          {event.startDate ? format(new Date(event.startDate), "MMM") : ""}
                        </span>
                        <span className="text-sm font-bold leading-none">
                          {event.startDate ? format(new Date(event.startDate), "dd") : ""}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.startDate ? format(new Date(event.startDate), "h:mm a") : ""}
                          {event.venue && ` • ${event.venue}`}
                        </p>
                      </div>
                      {isOrganizer && event._count && (
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {event._count.registrations} regs
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  {isOrganizer ? "No upcoming events. Create one to get started!" : "No upcoming events."}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
