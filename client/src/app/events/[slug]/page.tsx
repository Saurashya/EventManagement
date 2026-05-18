"use client"

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPin, Clock, Users, ArrowLeft, Ticket, CheckCircle2, CreditCard, Banknote } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'manual'>('stripe');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${resolvedParams.slug}/details`);
        setEvent(response.data);
      } catch (error) {
        toast.error("Event not found");
        router.push("/events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [resolvedParams.slug, router]);

  const handleRegister = async (tierId: string) => {
    setRegistering(true);
    try {
      if (!event) return;

      // Check if user is logged in
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to purchase tickets.");
        router.push("/login");
        return;
      }

      const { data: result } = await api.post("/payments/checkout", {
        eventId: event.id,
        ticketTierId: tierId,
        paymentMethod,
      });

      if (result.type === "free") {
        toast.success("Successfully registered for the event! Check your dashboard for the ticket.");
        router.push("/dashboard/tickets");
      } else if (result.type === "manual") {
        toast.success("Registration submitted! Your ticket is pending organizer confirmation.");
        router.push("/dashboard/tickets");
      } else if (result.type === "checkout" && result.checkoutUrl) {
        toast.info("Redirecting to payment...");
        window.location.href = result.checkoutUrl;
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const tiers = event.ticketTiers || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="w-full h-[40vh] md:h-[50vh] relative">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'})` }}
        />
        <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-end pb-12 max-w-6xl">
          <Link href="/events" className="absolute top-8 left-4 text-white/80 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" /> Back to events
          </Link>
          
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold tracking-wider">
              {event.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                <span>{format(new Date(event.startDate), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-border pb-2">About This Event</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-border pb-2">Location & Schedule</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Date and Time</h3>
                    <p className="text-muted-foreground mt-1">
                      Start: {format(new Date(event.startDate), "MMM d, yyyy • h:mm a")}<br />
                      End: {format(new Date(event.endDate), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Location</h3>
                    <p className="text-muted-foreground mt-1">{event.location}</p>
                    {event.isVirtual && (
                      <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md">Virtual Event</span>
                    )}
                  </div>
                </div>
              </div>
            </section>
            <section className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-border pb-2">Event Agenda</h2>
              {event.sessions && event.sessions.length > 0 ? (
                <div className="space-y-4">
                  {event.sessions.map((session: any) => (
                    <div key={session.id} className="flex gap-6 p-4 rounded-xl bg-card/30 border border-border/50">
                      <div className="w-24 shrink-0 text-indigo-400 font-bold">
                        {format(new Date(session.startTime), "h:mm a")}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">{session.title}</h3>
                        {session.speaker && (
                          <p className="text-sm text-indigo-300 font-medium">Speaker: {session.speaker}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{session.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-card/20 rounded-xl border border-dashed border-border/50">
                  <p className="text-muted-foreground italic">Full agenda to be announced soon.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar / Tickets */}
          <div className="space-y-6">
            <Card className="bg-card/40 backdrop-blur-md border-indigo-500/20 shadow-2xl sticky top-24">
              <CardHeader className="bg-indigo-950/40 border-b border-indigo-500/20 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-400" />
                  Tickets
                </CardTitle>
                <CardDescription>Select a ticket tier to register</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {tiers.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-muted-foreground italic">Tickets are not yet available for this event. Please check back later.</p>
                    </div>
                  ) : (
                    tiers.map((tier: Record<string, any>) => (
                      <div key={tier.id} className="p-6 space-y-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{tier.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-emerald-400">
                              {tier.price === 0 ? "Free" : `$${tier.price}`}
                            </span>
                          </div>
                        </div>

                        {/* Payment Method Selector — only for paid tickets */}
                        {tier.price > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Method</p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setPaymentMethod('stripe')}
                                className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                                  paymentMethod === 'stripe'
                                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/50'
                                    : 'border-border/50 text-muted-foreground hover:border-border hover:bg-white/[0.02]'
                                }`}
                              >
                                <CreditCard className="w-4 h-4" />
                                <span>Card</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentMethod('manual')}
                                className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                                  paymentMethod === 'manual'
                                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/50'
                                    : 'border-border/50 text-muted-foreground hover:border-border hover:bg-white/[0.02]'
                                }`}
                              >
                                <Banknote className="w-4 h-4" />
                                <span>Manual</span>
                              </button>
                            </div>
                            {paymentMethod === 'manual' && (
                              <p className="text-xs text-amber-400/80 bg-amber-500/5 p-2 rounded-md">
                                Your ticket will be pending until the organizer confirms your payment.
                              </p>
                            )}
                          </div>
                        )}
                        
                        <Button 
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                          onClick={() => handleRegister(tier.id)}
                          disabled={registering}
                        >
                          {registering ? "Processing..." : tier.price === 0 ? "Get Free Ticket" : paymentMethod === 'stripe' ? "Pay with Card" : "Register & Pay Later"}
                        </Button>
                        
                        <ul className="text-xs text-muted-foreground space-y-2 mt-4">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                            Secure registration
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                            Instant QR Code access
                          </li>
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
