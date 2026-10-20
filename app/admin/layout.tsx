"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // 1. Fetch current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session || !session.user) {
          console.log("No active Supabase session found.");
          router.replace("/login");
          return;
        }

        const userEmail = session.user.email;
        const userId = session.user.id;

        // 2. Fetch profile using maybeSingle() instead of single() to avoid throwing missing row errors
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, email")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          console.error("Profiles fetch error:", profileError.message);
        }

        // 3. Fallback / Flexible Role check
        const fetchedRole = profile?.role;

        // Hardcode check or Role Check
        const isAdmin = fetchedRole === "admin" || userEmail === "admin@codehelio.com";

        if (!isAdmin) {
          console.warn("User is not an admin. Role:", fetchedRole, "Email:", userEmail);
          Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "You do not have administrator privileges to view this page.",
            confirmButtonColor: "#ef4444",
          });
          router.replace("/");
          return;
        }

        // Authorized successfully
        setIsAuthorized(true);
      } catch (err) {
        console.error("Auth verification error:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}