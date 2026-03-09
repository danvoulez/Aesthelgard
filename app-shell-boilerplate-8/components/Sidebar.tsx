"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import canonData from "@/config/canon.json";

export function Sidebar() {
  const pathname = usePathname();

  // Map the navigation pillars from canon.json to our nav items
  const navItems = canonData.navigation_pillars.map((pillar) => {
    // Dynamically get the icon from Lucide
    // @ts-ignore - We know the icon string exists in LucideIcons, but TS doesn't
    const IconComponent = LucideIcons[pillar.icon] || LucideIcons.Circle;
    
    // Map the IDs to routes. We'll use the first one as home, and others as their ID
    let href = `/${pillar.id}`;
    if (pillar.id === 'avatar') href = '/'; // Let's make avatar or something the home, or maybe keep comms as home.
    // Actually, let's just use the IDs as routes, and maybe map 'avatar' to '/'
    
    return {
      name: pillar.label,
      icon: IconComponent,
      href: pillar.id === canonData.navigation_pillars[0].id ? '/' : `/${pillar.id}`,
    };
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-full">
        <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 h-16">
          <h1 className="text-xl font-heading font-semibold text-zinc-900 dark:text-zinc-100">
            {canonData.meta.title.split(':')[0]}
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-medium text-sm">
              U
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                User
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                user@example.com
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors ${
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <div className={`p-1 rounded-full ${isActive ? 'bg-[var(--primary)]/10' : ''}`}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium mt-1 text-center leading-tight px-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
