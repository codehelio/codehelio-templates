"use client";

import { Menu, Bell, Search, User } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Toggle Mobile Sidebar */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Global Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-64 rounded-lg bg-slate-100 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
            AD
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-slate-800">Admin User</p>
            <p className="text-xs text-slate-500">admin@example.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}