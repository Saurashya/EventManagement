"use client"

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, DollarSign, Users, BarChart3, Ticket, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics/organizer");
        setData(res.data);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-16 text-muted-foreground">Failed to load analytics.</div>;
  }

  const stats = [
    { title: "Total Events", value: data.totalEvents, icon: CalendarDays, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Active Events", value: data.activeEvents, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { title: "Total Registrations", value: data.totalTickets, icon: Users, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { title: "Total Revenue", value: `NPR ${Number(data.totalRevenue).toLocaleString()}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { title: "Check-ins", value: data.totalCheckIns, icon: Ticket, color: "text-purple-400", bg: "bg-purple-400/10" },
    { title: "Conversion Rate", value: `${data.conversionRate}%`, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  const maxRevenue = Math.max(...(data.revenueByDay || []).map((d: any) => d.value), 1);
  const maxReg = Math.max(...(data.registrationTimeline || []).map((d: any) => d.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics & Reports</h2>
        <p className="text-muted-foreground">Deep insights into your event performance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue by Day */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Day</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {(data.revenueByDay || []).map((d: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative flex items-end justify-center" style={{ height: "140px" }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max((d.value / maxRevenue) * 100, 4)}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                        className="w-full max-w-[32px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Registration Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Registration Trend</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-[2px] h-48">
                {(data.registrationTimeline || []).map((d: any, i: number) => (
                  <div key={i} className="flex-1 flex items-end justify-center" style={{ height: "180px" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((d.count / maxReg) * 100, 2)}%` }}
                      transition={{ delay: 0.3 + i * 0.02, duration: 0.4 }}
                      className="w-full bg-purple-500/60 hover:bg-purple-400 transition-colors rounded-t-sm cursor-pointer"
                      title={`${d.date}: ${d.count} registrations`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Events Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Event Performance</CardTitle>
            <CardDescription>Your most recent events</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentEvents && data.recentEvents.length > 0 ? (
              <div className="space-y-4">
                {data.recentEvents.map((event: any) => {
                  const sold = event.totalSold || 0;
                  const cap = event.totalCapacity || 1;
                  const pct = Math.round((sold / cap) * 100);
                  return (
                    <div key={event.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event._count?.registrations || 0} registrations • {sold}/{cap} tickets sold
                          </p>
                        </div>
                        <span className="text-sm font-bold text-indigo-400">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.6, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No events to show.</div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
