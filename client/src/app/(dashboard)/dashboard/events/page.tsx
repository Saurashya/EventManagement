"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, MapPin, Users, Edit, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function MyEventsPage() {
  const [events, setEvents] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events/my-events");
        setEvents(response.data.events || []);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.patch(`/events/${id}/status`, { status: newStatus });
      setEvents(events.map(e => e.id === id ? { ...e, status: newStatus } : e));
      toast.success(`Event ${newStatus === 'PUBLISHED' ? 'published' : 'moved to draft'} successfully!`);
    } catch (error) {
      toast.error("Failed to update event status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-muted-foreground">Loading your events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Events</h2>
          <p className="text-muted-foreground">Manage and track your organized events.</p>
        </div>
        <Link href="/dashboard/events/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="bg-card/30 backdrop-blur-sm border-dashed border-2 border-border/50">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
              <CalendarIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              You haven&apos;t created any events yet. Get started by creating your first event.
            </p>
            <Link href="/dashboard/events/create">
              <Button variant="outline">Create Event</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 flex flex-col transition-all hover:border-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/10">
              <div 
                className="h-32 bg-cover bg-center" 
                style={{ backgroundImage: `url(${event.bannerUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})` }}
              />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1" title={event.title}>{event.title}</CardTitle>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    event.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    event.status === 'DRAFT' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {event.status}
                  </span>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                  <CalendarIcon className="w-3 h-3" />
                  {format(new Date(event.startDate), "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{event.venue || (event.isOnline ? 'Online' : 'TBA')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{event.capacity} Capacity</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2">
                <Button 
                  variant={event.status === 'PUBLISHED' ? 'outline' : 'default'} 
                  size="sm"
                  className={`h-8 px-3 text-xs ${event.status === 'DRAFT' ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-none' : ''}`}
                  onClick={() => handleStatusUpdate(event.id, event.status)}
                >
                  {event.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </Button>
                
                <div className="flex gap-2">
                  <Link href={`/dashboard/events/${event.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
