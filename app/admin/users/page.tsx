"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Swal from "sweetalert2";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  X,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_paid: boolean;
  paid_amount: number;
  paid_currency: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [isPaid, setIsPaid] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  // Fetch Users from profiles table
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) {
      Swal.fire("Error!", error.message, "error");
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setRole("user");
    setIsPaid(false);
    setPaidAmount(0);
  };

  // CREATE USER (Supabase Auth + Profiles Upsert to prevent duplicate pkey error)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    Swal.showLoading();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (authError) {
      Swal.fire("Auth Error!", authError.message, "error");
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      Swal.fire("Error!", "Could not create auth user ID.", "error");
      return;
    }

    // Upsert profile data to prevent primary key duplicate error
    const { error: profileError } = await supabase.from("profiles").upsert([
      {
        id: userId,
        email,
        full_name: fullName,
        phone,
        role,
        is_paid: isPaid,
        paid_amount: paidAmount,
        paid_currency: "LKR",
      },
    ]);

    if (profileError) {
      Swal.fire("Profile Error!", profileError.message, "error");
    } else {
      Swal.fire({
        icon: "success",
        title: "User Created!",
        text: "New user registered successfully with display name.",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsCreateOpen(false);
      resetForm();
      fetchUsers();
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (user: UserProfile) => {
    setCurrentUser(user);
    setFullName(user.full_name || "");
    setPhone(user.phone || "");
    setRole(user.role || "user");
    setIsPaid(user.is_paid || false);
    setPaidAmount(user.paid_amount || 0);
    setIsEditOpen(true);
  };

  // UPDATE USER PROFILE & ROLE
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    Swal.showLoading();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        role,
        is_paid: isPaid,
        paid_amount: paidAmount,
        updated_at: new Date(),
      })
      .eq("id", currentUser.id);

    if (error) {
      Swal.fire("Update Error!", error.message, "error");
    } else {
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "User details updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsEditOpen(false);
      setCurrentUser(null);
      resetForm();
      fetchUsers();
    }
  };

  // QUICK ROLE CHANGE FROM TABLE COMBOBOX
  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      Swal.fire("Error!", error.message, "error");
    } else {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      Swal.fire({
        icon: "success",
        title: "Role Updated",
        text: `User role changed to ${newRole}`,
        timer: 1000,
        showConfirmButton: false,
      });
    }
  };

  // DELETE USER
  const handleDeleteUser = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the user profile data!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) {
        Swal.fire("Error!", error.message, "error");
      } else {
        Swal.fire("Deleted!", "User profile has been deleted.", "success");
        fetchUsers();
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users Management</h1>
          <p className="text-sm text-slate-500">View, create, edit, delete users and change roles.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">Role (Select Combox)</th>
                  <th className="px-6 py-4 font-semibold">Payment Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                          {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.full_name || "Unnamed User"}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.phone || "N/A"}</td>
                    
                    {/* COMBOX / DROPDOWN FOR ROLE CHANGE IN TABLE */}
                    <td className="px-6 py-4">
                      <select
                        value={u.role || "user"}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="ch_user">CH-User</option>
                        <option value="creator">Creator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      {u.is_paid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle className="size-3" /> Paid ({u.paid_currency || "LKR"} {u.paid_amount})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                          <XCircle className="size-3" /> Free User
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-xl font-bold text-slate-900">Create New User</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Kasun Perera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="ch_user">CH-User</option>
                    <option value="creator">Creator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Is Paid Member?</span>
                </label>
                {isPaid && (
                  <input
                    type="number"
                    placeholder="Amount (LKR)"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:outline-none"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-xl font-bold text-slate-900">Edit User Profile</h2>
              <button onClick={() => setIsEditOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="ch_user">CH-User</option>
                    <option value="creator">Creator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Is Paid Member?</span>
                </label>
                {isPaid && (
                  <input
                    type="number"
                    placeholder="Amount (LKR)"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:outline-none"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}