"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => {
      const data = { ...prev, [name]: val };
      if (name === "title" && !prev.slug) {
        data.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return data;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/events", {
        ...formData,
        capacity: Number(formData.capacity),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });

      toast.success("Event created successfully!");
      router.push("/dashboard/events");
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to create event";
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/events">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create New Event</h2>
          <p className="text-muted-foreground">Fill in the details to publish your next great event.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8">
          <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about what your event is and what it&apos;s about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title <span className="text-red-400">*</span></Label>
                  <Input 
                    id="title" name="title" required 
                    placeholder="e.g. Next.js Conf 2026"
                    value={formData.title} onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Event URL Slug</Label>
                  <Input 
                    id="slug" name="slug" required 
                    placeholder="e.g. nextjs-conf-2026"
                    value={formData.slug} onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-red-400">*</span></Label>
                <Textarea 
                  id="description" name="description" required 
                  placeholder="Describe your event..."
                  className="min-h-[120px] resize-y"
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

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/events">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[150px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Publish Event
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
