"use client"

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function MarketingPage() {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxUses: "100",
    validUntil: "",
    eventId: "" // Ideally selected from a dropdown of organizer's events
  });
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [promoRes, eventsRes] = await Promise.all([
          api.get("/events/promo-codes/all"), // Mock endpoint or needs to be added
          api.get("/events/my-events")
        ]);
        setPromoCodes(promoRes.data);
        setEvents(eventsRes.data);
        if (eventsRes.data.length > 0) {
          setNewPromo(prev => ({ ...prev, eventId: eventsRes.data[0].id }));
        }
      } catch (error) {
        console.error("Failed to load marketing data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddPromo = async () => {
    try {
      const response = await api.post("/events/promo-codes", {
        ...newPromo,
        discountValue: Number(newPromo.discountValue),
        maxUses: Number(newPromo.maxUses),
        validUntil: new Date(newPromo.validUntil).toISOString()
      });
      setPromoCodes([response.data, ...promoCodes]);
      setIsAdding(false);
      toast.success("Promo code created!");
    } catch (error) {
      toast.error("Failed to create promo code");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Marketing & Promotions</h2>
          <p className="text-muted-foreground">Manage promo codes and discount campaigns.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          {isAdding ? "Cancel" : "Create Promo Code"}
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-card/40 backdrop-blur-md border-indigo-500/20">
          <CardHeader>
            <CardTitle>New Promo Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                <Input placeholder="E.g. EARLYBIRD20" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Value</label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Value" className="flex-1" value={newPromo.discountValue} onChange={e => setNewPromo({...newPromo, discountValue: e.target.value})} />
                  <select 
                    className="bg-background border border-input px-3 rounded-md text-sm"
                    value={newPromo.discountType}
                    onChange={e => setNewPromo({...newPromo, discountType: e.target.value})}
                  >
                    <option value="PERCENTAGE">%</option>
                    <option value="FIXED">$</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Uses</label>
                <Input type="number" value={newPromo.maxUses} onChange={e => setNewPromo({...newPromo, maxUses: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valid Until</label>
                <Input type="date" value={newPromo.validUntil} onChange={e => setNewPromo({...newPromo, validUntil: e.target.value})} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Associated Event</label>
                <select 
                  className="w-full bg-background border border-input px-3 h-10 rounded-md text-sm"
                  value={newPromo.eventId}
                  onChange={e => setNewPromo({...newPromo, eventId: e.target.value})}
                >
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleAddPromo} className="w-full bg-indigo-600">Create Campaign</Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No promo codes active.
                  </TableCell>
                </TableRow>
              ) : (
                promoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold">{promo.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {promo.usedCount} / {promo.maxUses}
                        <div className="w-24 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${Math.min(100, (promo.usedCount / promo.maxUses) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(promo.validUntil), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.isActive ? "default" : "secondary"}>
                        {promo.isActive ? "Active" : "Expired"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
