"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    shortDesc: "",
    category: "Technology",
    startDate: "",
    endDate: "",
    venue: "",
    address: "",
    city: "Kathmandu",
    country: "Nepal",
    capacity: 100,
    bannerUrl: "",
    isOnline: false,
    meetingUrl: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        // Format dates for datetime-local input
        const start = new Date(data.startDate).toISOString().slice(0, 16);
        const end = new Date(data.endDate).toISOString().slice(0, 16);
        
        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          description: data.description || "",
          shortDesc: data.shortDesc || "",
          category: data.category || "Technology",
          startDate: start,
          endDate: end,
          venue: data.venue || "",
          address: data.address || "",
          city: data.city || "Kathmandu",
          country: data.country || "Nepal",
          capacity: data.capacity || 100,
          bannerUrl: data.bannerUrl || "",
          isOnline: data.isOnline || false,
          meetingUrl: data.meetingUrl || "",
        });
        
        // Fetch tiers
        const tiersRes = await api.get(`/tickets/event/${id}`);
        setTiers(tiersRes.data);
      } catch (err) {
        toast.error("Failed to load event details");
        router.push("/dashboard/events");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.patch(`/events/${id}`, {
        ...formData,
        capacity: Number(formData.capacity),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });

      toast.success("Event updated successfully!");
      router.push("/dashboard/events");
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to update event";
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-muted-foreground font-medium">Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/events">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground">Update your event details and settings.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                {formData.bannerUrl && (
                  <img 
                    src={formData.bannerUrl} 
                    alt="Cover Preview" 
                    className="w-full h-full object-cover opacity-60"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">{formData.title || "Event Title"}</h3>
                    <p className="text-white/80 drop-shadow-sm">{formData.shortDesc || "Event tagline will appear here"}</p>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>The core details of your event.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title <span className="text-red-400">*</span></Label>
                  <Input 
                    id="title" name="title" required 
                    placeholder="e.g. Nepal Cloud Conference 2026"
                    value={formData.title} onChange={handleChange} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description <span className="text-red-400">*</span></Label>
                  <Textarea 
                    id="description" name="description" required rows={6}
                    placeholder="Describe what your event is about..."
                    value={formData.description} onChange={handleChange} 
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category" name="category" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.category} onChange={handleChange}
                    >
                      <option value="Technology">Technology</option>
                      <option value="Music">Music & Arts</option>
                      <option value="Business">Business</option>
                      <option value="Education">Education</option>
                      <option value="Sports">Sports & Fitness</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bannerUrl">Cover Image URL</Label>
                    <Input 
                      id="bannerUrl" name="bannerUrl" 
                      placeholder="https://images.unsplash.com/..."
                      value={formData.bannerUrl} onChange={handleChange} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDesc">Short Tagline</Label>
                  <Input 
                    id="shortDesc" name="shortDesc" 
                    placeholder="A catchy one-liner for your event..."
                    value={formData.shortDesc} onChange={handleChange} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Date & Location</CardTitle>
                <CardDescription>When and where is your event happening?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time <span className="text-red-400">*</span></Label>
                    <Input 
                      id="startDate" name="startDate" type="datetime-local" required 
                      value={formData.startDate} onChange={handleChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time <span className="text-red-400">*</span></Label>
                    <Input 
                      id="endDate" name="endDate" type="datetime-local" required 
                      value={formData.endDate} onChange={handleChange} 
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pb-2">
                  <input
                    type="checkbox"
                    id="isOnline"
                    name="isOnline"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    checked={formData.isOnline}
                    onChange={handleChange}
                  />
                  <Label htmlFor="isOnline">This is an online/virtual event</Label>
                </div>

                {formData.isOnline ? (
                  <div className="space-y-2">
                    <Label htmlFor="meetingUrl">Meeting Link (Zoom, Meet, etc.)</Label>
                    <Input 
                      id="meetingUrl" name="meetingUrl" 
                      placeholder="https://meet.google.com/..."
                      value={formData.meetingUrl} onChange={handleChange} 
                    />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue Name <span className="text-red-400">*</span></Label>
                      <Input 
                        id="venue" name="venue" required={!formData.isOnline}
                        placeholder="e.g. Moscone Center"
                        value={formData.venue} onChange={handleChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Full Address</Label>
                      <Input 
                        id="address" name="address" 
                        placeholder="e.g. 747 Howard St"
                        value={formData.address} onChange={handleChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" name="city" 
                        value={formData.city} onChange={handleChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" name="country" 
                        value={formData.country} onChange={handleChange} 
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity <span className="text-red-400">*</span></Label>
                  <Input 
                    id="capacity" name="capacity" type="number" min="1" required 
                    value={formData.capacity} onChange={handleChange} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Ticket Tiers</CardTitle>
                <CardDescription>Manage ticket pricing and capacity for your event.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {tiers.length === 0 ? (
                    <div className="text-center p-4 border border-dashed border-border/50 rounded-lg">
                      <p className="text-muted-foreground text-sm">No ticket tiers yet. Create one below.</p>
                    </div>
                  ) : (
                    tiers.map(tier => (
                      <div key={tier.id} className="flex items-center justify-between p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <div>
                          <h4 className="font-bold">{tier.name}</h4>
                          <p className="text-sm text-muted-foreground">{tier.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400">{tier.price === 0 ? 'Free' : `NPR ${tier.price}`}</p>
                          <p className="text-xs text-muted-foreground">{tier.quantity} total capacity</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t border-border/50">
                  <h4 className="font-semibold mb-4">Add New Ticket Tier</h4>
                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    <div className="space-y-2">
                      <Label>Tier Name</Label>
                      <Input placeholder="e.g. VIP Access" id="newTierName" />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (NPR)</Label>
                      <Input type="number" placeholder="0 for Free" id="newTierPrice" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Input placeholder="What does this ticket include?" id="newTierDesc" />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity Available</Label>
                      <Input type="number" placeholder="100" id="newTierQty" />
                    </div>
                  </div>
                  <Button type="button" onClick={() => {
                    const name = (document.getElementById('newTierName') as HTMLInputElement).value;
                    const price = Number((document.getElementById('newTierPrice') as HTMLInputElement).value);
                    const desc = (document.getElementById('newTierDesc') as HTMLInputElement).value;
                    const qty = Number((document.getElementById('newTierQty') as HTMLInputElement).value);
                    
                    if (!name || !qty) return toast.error("Name and Quantity are required");
                    
                    api.post(`/tickets/event/${id}/tier`, {
                      name,
                      description: desc,
                      price,
                      quantity: qty,
                      type: price === 0 ? "FREE" : "PAID"
                    }).then(() => {
                      toast.success("Ticket tier added!");
                      window.location.reload();
                    }).catch(() => toast.error("Failed to add ticket tier"));
                  }} className="w-full bg-slate-800 hover:bg-slate-700 text-white">
                    Create Ticket Tier
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Save or manage your event status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
                <Link href="/dashboard/events">
                  <Button variant="outline" className="w-full mt-2" type="button">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="bg-indigo-500/10 border-indigo-500/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-indigo-400 text-lg">Pro Tip</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-indigo-200/70 leading-relaxed">
                Make sure your event description is compelling! Events with detailed agendas and high-quality cover images get 3x more registrations.
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
