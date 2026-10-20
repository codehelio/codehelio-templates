"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Layout,
  Crown,
  UserCheck,
  RefreshCw,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    chUsers: 0,
    normalUsers: 0,
    totalTemplates: 0,
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [templatesList, setTemplatesList] = useState<any[]>([]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users / Profiles from Supabase
      const { data: profiles, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profileErr) console.error("Error fetching profiles:", profileErr);

      const allProfiles = profiles || [];
      const customers = allProfiles.filter(p => p.role !== "admin" && p.role !== "creator");
      const chUsersCount = customers.filter(p => p.role === "ch_user").length;
      const normalUsersCount = customers.filter(p => p.role === "user").length;

      // 2. Fetch Templates from Supabase
      const { data: templates, error: templateErr } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (templateErr) console.error("Error fetching templates:", templateErr);

      setStats({
        totalUsers: allProfiles.length,
        chUsers: chUsersCount,
        normalUsers: normalUsersCount,
        totalTemplates: templates?.length || 0,
      });

      setUsersList(allProfiles.slice(0, 6));
      setTemplatesList(templates?.slice(0, 6) || []);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Admin Management & Overview
          </h1>
          <p className="text-sm text-slate-500">
            Live Supabase database insights for Users and Templates.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top Count Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 border border-indigo-100">
              <Users className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900">{loading ? "..." : stats.totalUsers}</span>
            <p className="mt-1 text-xs text-slate-500">All registered system users</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CH-Users (Paid)</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 border border-emerald-100">
              <Crown className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900">{loading ? "..." : stats.chUsers}</span>
            <p className="mt-1 text-xs text-slate-500">Verified application privilege</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Standard Users</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 border border-amber-100">
              <UserCheck className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900">{loading ? "..." : stats.normalUsers}</span>
            <p className="mt-1 text-xs text-slate-500">Free preview accounts</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Templates</span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 border border-blue-100">
              <Layout className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900">{loading ? "..." : stats.totalTemplates}</span>
            <p className="mt-1 text-xs text-slate-500">Catalog templates in database</p>
          </div>
        </div>
      </div>

      {/* Two Columns Section: Users & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Users Management & Count */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Registered Users ({stats.totalUsers})</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">User Profile</th>
                  <th className="px-3.5 py-2.5 font-semibold">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.length > 0 ? (
                  usersList.map((u) => (
                    <tr key={u.id}>
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-slate-900">{u.full_name || "User"}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                          u.role === "admin" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                          u.role === "creator" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                          u.role === "ch_user" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-3.5 py-6 text-center text-slate-400 text-xs">
                      {loading ? "Loading users..." : "No users found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: Templates Management & Count */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Catalog Templates ({stats.totalTemplates})</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">Template Title</th>
                  <th className="px-3.5 py-2.5 font-semibold">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templatesList.length > 0 ? (
                  templatesList.map((t) => (
                    <tr key={t.id || t.slug}>
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{t.blurb}</div>
                      </td> 
                      <td className="px-3.5 py-3">
                        <div className="text-xs font-bold text-slate-700">{t.category || "General"}</div>
                        <div className="text-xs font-semibold text-helio">{t.price ? `LKR ${t.price}` : "Free"}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-3.5 py-6 text-center text-slate-400 text-xs">
                      {loading ? "Loading templates..." : "No templates found in database."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}