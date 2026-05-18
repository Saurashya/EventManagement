"use client"

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const isHome = pathname === "/";

  return (
    <nav className={`w-full z-50 ${isHome ? "absolute top-0 left-0 bg-transparent" : "sticky top-0 bg-background/80 backdrop-blur-md border-b border-border"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-sm tracking-tighter">EP</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">EventPro</span>
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-8">
              <Link href="/events" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Discover Events
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-sm font-medium">Dashboard</Button>
                </Link>
                <div className="h-8 w-8 rounded-full bg-indigo-900 border border-indigo-500/30 overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-300 font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm font-medium hover:text-indigo-400">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
