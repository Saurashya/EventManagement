"use client"

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Plus, Send, BarChart2, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function EngagementPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Announcement form
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annEventId, setAnnEventId] = useState("");
  const [annSending, setAnnSending] = useState(false);

  // Poll form
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollEventId, setPollEventId] = useState("");
  const [pollSending, setPollSending] = useState(false);

  const fetchData = async () => {
    try {
      const [annRes, pollRes, eventsRes] = await Promise.all([
        api.get("/engagement/announcements"),
        api.get("/engagement/polls"),
        api.get("/events/my-events"),
      ]);
      setAnnouncements(annRes.data);
      setPolls(pollRes.data);
      setEvents(eventsRes.data.events || []);
    } catch (error) {
      console.error("Failed to load engagement data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSendAnnouncement = async () => {
    if (!annTitle || !annContent || !annEventId) {
      toast.error("Please fill all fields and select an event");
      return;
    }
    setAnnSending(true);
    try {
      await api.post("/engagement/announcements", {
        eventId: annEventId,
        title: annTitle,
        content: annContent,
      });
      toast.success("Announcement sent!");
      setAnnTitle("");
      setAnnContent("");
      setAnnEventId("");
      fetchData();
    } catch (error) {
      toast.error("Failed to send announcement");
    } finally {
      setAnnSending(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.delete(`/engagement/announcements/${id}`);
      toast.success("Announcement deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleCreatePoll = async () => {
    const validOptions = pollOptions.filter((o) => o.trim());
    if (!pollQuestion || validOptions.length < 2 || !pollEventId) {
      toast.error("Question, at least 2 options, and event required");
      return;
    }
    setPollSending(true);
    try {
      await api.post("/engagement/polls", {
        eventId: pollEventId,
        question: pollQuestion,
        options: validOptions,
      });
      toast.success("Poll created!");
      setPollQuestion("");
      setPollOptions(["", ""]);
      setPollEventId("");
      setShowPollForm(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to create poll");
    } finally {
      setPollSending(false);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      await api.patch(`/engagement/polls/${pollId}/close`);
      toast.success("Poll closed");
      fetchData();
    } catch {
      toast.error("Failed to close poll");
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    try {
      await api.delete(`/engagement/polls/${pollId}`);
      toast.success("Poll deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete poll");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Attendee Engagement</h2>
        <p className="text-muted-foreground">Keep your audience informed and active during the event.</p>
      </div>

      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="announcements" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Megaphone className="w-4 h-4 mr-2" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="polls" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <BarChart2 className="w-4 h-4 mr-2" />
            Live Polls
          </TabsTrigger>
        </TabsList>

        {/* ─── ANNOUNCEMENTS TAB ─── */}
        <TabsContent value="announcements" className="mt-6 space-y-6">
          <Card className="bg-card/40 backdrop-blur-md border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-lg">Broadcast Announcement</CardTitle>
              <CardDescription>Send a notification to all registered attendees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={annEventId} onValueChange={(v) => setAnnEventId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Announcement Title"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
              />
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Write your message here..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
              />
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={handleSendAnnouncement}
                disabled={annSending}
              >
                <Send className="w-4 h-4 mr-2" />
                {annSending ? "Sending..." : "Broadcast Now"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Past Announcements</h3>
            {announcements.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground italic">No announcements sent yet.</p>
            ) : (
              announcements.map((ann) => (
                <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-card/30 border-border/50 group">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-md font-bold">{ann.title}</CardTitle>
                          {ann.event && <p className="text-xs text-indigo-400">{ann.event.title}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{format(new Date(ann.createdAt), "MMM d, h:mm a")}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 h-6 w-6 p-0"
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{ann.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* ─── POLLS TAB ─── */}
        <TabsContent value="polls" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Active Polls</h3>
            <Button
              size="sm"
              variant="outline"
              className="border-indigo-500/30 text-indigo-400"
              onClick={() => setShowPollForm(!showPollForm)}
            >
              {showPollForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {showPollForm ? "Cancel" : "Create New Poll"}
            </Button>
          </div>

          {/* Create Poll Form */}
          {showPollForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <Card className="bg-card/40 backdrop-blur-md border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-lg">New Poll</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={pollEventId} onValueChange={(v) => setPollEventId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Poll question..."
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                  />
                  <div className="space-y-2">
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const next = [...pollOptions];
                            next[i] = e.target.value;
                            setPollOptions(next);
                          }}
                        />
                        {pollOptions.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-400 h-8 w-8 p-0"
                            onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPollOptions([...pollOptions, ""])}
                      className="text-indigo-400"
                    >
                      + Add Option
                    </Button>
                  </div>
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleCreatePoll}
                    disabled={pollSending}
                  >
                    {pollSending ? "Creating..." : "Create Poll"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {polls.length === 0 ? (
              <div className="md:col-span-2 text-center py-12 bg-card/20 rounded-xl border border-dashed border-border/50">
                <BarChart2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No polls created yet.</p>
              </div>
            ) : (
              polls.map((poll) => (
                <Card key={poll.id} className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{poll.question}</CardTitle>
                    <CardDescription>
                      {poll.event?.title || "Event poll"} • {poll.isActive ? "Live" : "Closed"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {poll.options?.map((opt: any) => {
                      const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{opt.text}</span>
                            <span className="font-bold">{percentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                  <CardFooter className="border-t border-border/30 pt-4 flex justify-between items-center text-xs text-muted-foreground">
                    <span>{poll.totalVotes} votes cast</span>
                    <div className="flex gap-2">
                      {poll.isActive && (
                        <Button variant="ghost" size="sm" className="h-8 text-amber-400 hover:text-amber-300" onClick={() => handleClosePoll(poll.id)}>
                          Close Poll
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 text-rose-400 hover:text-rose-300" onClick={() => handleDeletePoll(poll.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
