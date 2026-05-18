"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, MapPin, Search, Ticket } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/layout/Navbar";

export default function DiscoverEventsPage() {
  const [events, setEvents] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events");
        setEvents(response.data.events || []);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute inset-0 bg-indigo-900/10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background"></div>
        <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
              Discover Amazing Events
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Find and book tickets for the best tech, music, and business events happening near you.
            </p>
            
            <div className="mt-8 max-w-md mx-auto relative flex items-center">
              <Search className="absolute left-3 w-5 h-5 text-muted-foreground" />
              <Input 
                className="pl-10 h-12 bg-card/50 backdrop-blur-md border-indigo-500/30 focus-visible:ring-indigo-500/50 text-base rounded-full" 
                placeholder="Search events by name or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container px-4 md:px-6 mx-auto max-w-7xl py-12">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="h-80 rounded-xl bg-card/50 animate-pulse border border-border/50"></div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group">
                <div 
                  className="h-48 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                  style={{ backgroundImage: `url(${event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})` }}
                />
                <CardHeader className="relative z-10 bg-card">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="line-clamp-2 text-lg leading-tight" title={event.title}>
                      <Link href={`/events/${event.slug}`} className="hover:text-indigo-400 transition-colors">
                        {event.title}
                      </Link>
                    </CardTitle>
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      {event.category}
                    </span>
                  </div>
                  <CardDescription className="flex items-center gap-1.5 mt-2 font-medium text-indigo-200/70">
                    <CalendarIcon className="w-4 h-4" />
                    {format(new Date(event.startDate), "MMM d, yyyy • h:mm a")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-card flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="line-clamp-1">{event.venue || (event.isOnline ? 'Online' : 'TBA')}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-card/50 border-t border-border/50 p-4">
                  <Link href={`/events/${event.slug}`} className="w-full">
                    <Button className="w-full bg-white text-indigo-950 hover:bg-indigo-50 font-semibold gap-2">
                      <Ticket className="w-4 h-4" />
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
