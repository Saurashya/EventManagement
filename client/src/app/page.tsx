"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Ticket, BarChart3, Users, Globe, Zap, ArrowRight, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-heading tracking-tight">EventPro</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-indigo-400 transition-colors">
            Sign In
          </Link>
          <Link href="/register">
            <Button className="bg-white text-slate-950 hover:bg-slate-200 rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md text-sm text-indigo-300 mb-4">
            <Zap className="w-4 h-4" />
            <span>EventPro 2.0 is now available in Beta</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-tighter leading-[1.1]">
            Events engineered for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">
              maximum impact
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The enterprise-grade platform for modern teams to plan, market, and execute flawless experiences at any scale.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity border-0 shadow-xl shadow-indigo-500/20">
                Start for free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white backdrop-blur-md">
              Book a Demo
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mt-24 relative mx-auto max-w-5xl"
        >
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-2 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="rounded-xl border border-white/5 bg-slate-950 overflow-hidden aspect-video relative flex items-center justify-center">
               <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
               <div className="text-center space-y-4 relative z-10 p-8">
                 <BarChart3 className="w-16 h-16 text-indigo-500 mx-auto opacity-50" />
                 <h3 className="text-2xl font-heading font-bold text-slate-300">Intelligent Dashboard</h3>
                 <p className="text-slate-500">Real-time revenue, attendance, and engagement metrics.</p>
               </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-32 border-t border-white/10 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-heading font-bold mb-4">Everything you need to host</h2>
            <p className="text-lg text-slate-400">Replace your fragmented tool stack with one unified, intelligent platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Ticket, title: "Dynamic Ticketing", desc: "Multi-tier pricing, promo codes, and automated tax handling." },
              { icon: Calendar, title: "Smart Agenda", desc: "Conflict-free scheduling with multi-track support and speaker portals." },
              { icon: Users, title: "Attendee CRM", desc: "Deep insights into your audience, from registration to post-event." },
              { icon: Globe, title: "Global Reach", desc: "Built-in localization, multi-currency support, and localized payments." },
              { icon: ShieldCheck, title: "Enterprise Security", desc: "SSO, role-based access control, and GDPR compliance built-in." },
              { icon: BarChart3, title: "Live Analytics", desc: "Watch ticket sales and check-ins happen in real-time with beautiful charts." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/20">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="relative z-10 py-24 border-t border-white/10 bg-indigo-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Ready to host your best event yet?</h2>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Join thousands of organizers who use EventPro to create unforgettable experiences. Start for free today.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 text-lg bg-white text-indigo-950 hover:bg-slate-100 font-bold rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all">
              Create Your First Event <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white text-xs font-bold">EP</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">EventPro</span>
          </div>
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} EventPro platform. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Terms</Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy</Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
