"use client"

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Users, Search, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        // This endpoint should ideally fetch all registrations for events owned by the user
        // For now, let's assume we can fetch them or we'll need to fetch per event
        const response = await api.get("/registrations/my-events-registrations");
        setRegistrations(response.data);
      } catch (error) {
        console.error("Failed to load registrations", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter(reg => 
    reg.attendeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.attendeeEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading registrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Registrations</h2>
          <p className="text-muted-foreground">View and manage attendees for your events.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, email or event..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attendee</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Ticket Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No registrations found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{reg.attendeeName || reg.user?.name}</span>
                        <span className="text-xs text-muted-foreground">{reg.attendeeEmail || reg.user?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{reg.event.title}</TableCell>
                    <TableCell>{reg.ticketTier.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(reg.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={reg.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {reg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 gap-2 hover:bg-indigo-500/10 hover:text-indigo-400">
                        <Printer className="w-3.5 h-3.5" />
                        Print Badge
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
