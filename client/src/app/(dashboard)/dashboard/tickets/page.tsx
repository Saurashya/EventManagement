"use client"

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, CalendarIcon, MapPin, ExternalLink, TicketIcon, CreditCard } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

export default function MyTicketsPage() {
  const [registrations, setRegistrations] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyAndFetch = async () => {
      // If returning from Stripe, verify the session first
      const paymentStatus = searchParams.get("payment");
      const sessionId = searchParams.get("session_id");

      if (paymentStatus === "success" && sessionId) {
        try {
          await api.get(`/payments/verify-session/${sessionId}`);
          toast.success("Payment successful! Your ticket is confirmed.");
        } catch {
          toast.error("Could not verify payment. Please check your tickets.");
        }
      }

      // Now fetch tickets
      try {
        const response = await api.get("/registrations/my-registrations");
        setRegistrations(response.data);
      } catch (error) {
        console.error("Failed to load tickets", error);
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetch();
  }, [searchParams]);

  const handlePayNow = async (registrationId: string) => {
    setPayingId(registrationId);
    try {
      const response = await api.post(`/payments/pay-pending/${registrationId}`);
      if (response.data?.checkoutUrl) {
        toast.info("Redirecting to secure payment...");
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to initialize payment. Please try again later.";
      toast.error(Array.isArray(message) ? message[0] : message);
      setPayingId(null);
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading your tickets...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Tickets</h2>
        <p className="text-muted-foreground">View and manage your upcoming event registrations.</p>
      </div>

      {registrations.length === 0 ? (
        <Card className="bg-card/30 backdrop-blur-sm border-dashed border-2 border-border/50">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
              <TicketIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              You haven&apos;t registered for any events yet. Discover upcoming events and secure your spot!
            </p>
            <Link href="/events">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Discover Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {registrations.map((reg) => (
            <Card key={reg.id} className="overflow-hidden bg-card/40 backdrop-blur-sm border-indigo-500/20 shadow-lg relative group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              
              <div className="flex justify-between items-start p-6 pb-2">
                <div>
                  <div className="text-xs font-semibold text-indigo-400 mb-1">{reg.event.category}</div>
                  <CardTitle className="text-lg leading-tight line-clamp-1" title={reg.event.title}>
                    {reg.event.title}
                  </CardTitle>
                </div>
                
                <Dialog>
                  <DialogTrigger render={<Button variant="outline" size="icon" className="shrink-0 rounded-full h-10 w-10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10" />}>
                    <QrCode className="w-5 h-5" />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md flex flex-col items-center justify-center py-10 bg-card border-indigo-500/20">
                    <DialogHeader className="text-center w-full">
                      <DialogTitle className="text-center text-xl mb-4">Event Ticket QR Code</DialogTitle>
                    </DialogHeader>
                    {reg.qrCode && (
                      <div className="p-4 bg-white rounded-xl shadow-2xl flex items-center justify-center">
                        <QRCodeSVG value={reg.qrCode} size={200} />
                      </div>
                    )}
                    <p className="text-center text-muted-foreground mt-6 max-w-xs text-sm">
                      Show this QR code at the event entrance for quick check-in.
                    </p>
                  </DialogContent>
                </Dialog>
              </div>
              
              <CardContent className="px-6 pt-4 pb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" /> Date
                    </div>
                    <div className="font-medium text-foreground">
                      {format(new Date(reg.event.startDate), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs flex items-center gap-1">
                      <TicketIcon className="w-3 h-3" /> Ticket Type
                    </div>
                    <div className="font-medium text-foreground">
                      {reg.ticketTier.name}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-dashed border-border/50">
                  <div className="text-muted-foreground text-xs flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" /> Location
                  </div>
                  <div className="font-medium text-sm line-clamp-1">{reg.event.location}</div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-muted/30 px-6 py-3 flex justify-between items-center border-t border-border/30 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md font-medium ${
                    reg.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' :
                    reg.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {reg.status}
                  </span>
                  
                  {reg.status === 'PENDING' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 gap-1.5"
                      onClick={() => handlePayNow(reg.id)}
                      disabled={payingId === reg.id}
                    >
                      <CreditCard className="w-3 h-3" />
                      {payingId === reg.id ? "Processing..." : "Pay Now"}
                    </Button>
                  )}
                </div>
                
                <Link href={`/events/${reg.event.slug}`} className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                  Event Page <ExternalLink className="w-3 h-3" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
