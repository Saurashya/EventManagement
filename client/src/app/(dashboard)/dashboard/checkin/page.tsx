"use client"

import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function CheckinPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCheckin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await api.post("/checkin/manual", { code });
      setResult({ success: true, ...response.data });
      toast.success("Check-in successful!");
      setCode("");
    } catch (err: any) {
      setResult({ success: false, message: err.response?.data?.message || "Check-in failed" });
      toast.error("Invalid ticket code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Check-in Scanner</h2>
        <p className="text-muted-foreground">Verify tickets and check in attendees.</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader>
            <CardTitle>Manual Entry</CardTitle>
            <CardDescription>Enter the ticket QR code string manually.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckin} className="flex gap-4">
              <Input 
                placeholder="Enter ticket code..." 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className={`border-2 ${result.success ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {result.success ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-500" />
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {result.success ? "Valid Ticket" : "Invalid Ticket"}
                  </h3>
                  {result.success ? (
                    <div className="mt-1 space-y-1">
                      <p className="text-foreground font-medium">{result.registration.attendeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.registration.event.title} - {result.registration.ticketTier.name}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{result.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card/40 backdrop-blur-md border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <QrCode className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-muted-foreground">Camera Scanner</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-2">
              In a production environment, this would integrate with the device camera to scan QR codes.
            </p>
            <Button variant="outline" className="mt-6" disabled>
              Launch Scanner
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
