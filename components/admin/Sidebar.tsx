"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  X,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Swal from "sweetalert2";

// Supabase Client Initializer
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Templates", href: "/admin/templates", icon: ShoppingBag },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Logout Functionality
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to log out from the admin portal?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Logout",
    });

    if (result.isConfirmed) {
      // 1. Supabase Session එක Sign Out කිරීම
      await supabase.auth.signOut();

      // 2. Local Storage Clean up (අවශ්‍ය නම්)
      try {
        localStorage.removeItem("codehelio_registered_users");
      } catch (err) {
        console.error("Local storage clear error:", err);
      }

      Swal.fire({
        icon: "success",
        title: "Logged Out!",
        text: "You have been logged out successfully.",
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        // Mobile Sidebar එක Close කර Login එකට Navigate වීම
        onClose();
        router.push("/login");
      });
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          {/* Top Brand Logo & Close Button */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 px-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-indigo-500" />
                <span className="text-xl font-bold tracking-wide">AdminPortal</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Logout Button */}
          <div className="border-t border-slate-800 pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-600/10 hover:text-red-500 transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}