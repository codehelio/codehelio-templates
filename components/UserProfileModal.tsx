"use client";

import { useState } from "react";
import {
  X,
  User,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Zap,
  ArrowRight,
  Crown,
} from "lucide-react";
import { UserProfile, upgradeToChUser } from "@/lib/supabase";
import { useCurrency } from "@/lib/currency";
import Swal from "sweetalert2";

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onUserUpdated: (updatedUser: UserProfile) => void;
}

export default function UserProfileModal({
  isOpen,
  user,
  onClose,
  onUserUpdated,
}: UserProfileModalProps) {
  const [upgrading, setUpgrading] = useState(false);
  const { currency, formatPrice } = useCurrency();

  if (!isOpen || !user) return null;

  const isEligibleForUpgrade = user.role === "user";
  const isChUserOrAbove = user.role === "ch_user" || user.role === "admin" || user.role === "creator";

  const handleUpgradePayment = async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: "CodeHelio CH-User Upgrade",
          description: `CH-User Upgrade for ${user.email}`,
          amount: 1.82,
          currency: "usd",
          userId: user.id,
          userEmail: user.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(data.error || "Could not create Stripe checkout session.");
    } catch (err: unknown) {
      console.error(err);
      setUpgrading(false);
      Swal.fire({
        icon: "error",
        title: "Checkout Error",
        text: "Could not open Stripe Checkout. Please try again.",
        confirmButtonColor: "#027cc7",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return { label: "System Administrator", color: "bg-rose-100 text-rose-700 border-rose-300" };
      case "creator":
        return { label: "Template Creator", color: "bg-purple-100 text-purple-700 border-purple-300" };
      case "ch_user":
        return { label: "Verified CH-User (Active)", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      default:
        return { label: "Standard User", color: "bg-amber-100 text-amber-800 border-amber-300" };
    }
  };

  const badge = getRoleBadge(user.role);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-ink/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ink/10">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-helio text-white font-bold text-lg shadow-sm">
              {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">{user?.full_name || user?.email?.split("@")[0] || "User"}</h3>
              <p className="text-xs text-ink/60">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-ink/40 hover:bg-mist hover:text-ink transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* User Details & Role Card */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-ink/10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Membership Level</span>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.color}`}>
                  <ShieldCheck className="size-3.5" />
                  <span>{badge.label}</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Permissions</span>
              <p className="text-xs font-bold text-ink/80 mt-1">
                {isChUserOrAbove ? "Templates View & Apply Allowed" : "Templates View & Live Demo Only"}
              </p>
            </div>
          </div>

          {/* Upgrade Section for Normal Users */}
          {isEligibleForUpgrade ? (
            <div className="relative overflow-hidden rounded-2xl border-2 border-helio/30 bg-gradient-to-br from-sky-50 via-white to-blue-50/50 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-helio/15 px-2.5 py-0.5 text-xs font-bold text-helio">
                    <Crown className="size-3.5" />
                    <span>Upgrade to CH-User</span>
                  </div>
                  <h4 className="mt-2 text-base font-extrabold text-ink">Unlock Instant Template Application</h4>
                  <p className="mt-1 text-xs text-ink/70 leading-relaxed">
                    Standard users can preview live demos. To submit an application and get assigned an engineer, upgrade to <strong>CH-User</strong> for a one-time fee of <strong>LKR 600 ($1.82)</strong>.
                  </p>
                </div>
              </div>

              {/* Benefits list */}
              <div className="mt-4 space-y-2 border-t border-helio/15 pt-3 text-xs text-ink/80 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Full access to click Apply & submit project specifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Email OTP security code verification before applying</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Unique Client Code generation & 48-Hour deployment guarantee</span>
                </div>
              </div>

              {/* Price and Upgrade Button */}
              <div className="mt-5 flex items-center justify-between pt-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-ink/50 font-semibold">One-time Fee</span>
                  <div className="text-xl font-black text-helio">
                    {currency === "USD" ? "$1.82" : "LKR 600"}
                    <span className="text-xs font-normal text-ink/50 ml-1.5">
                      ({currency === "USD" ? "LKR 600" : "$1.82 USD"})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={upgrading}
                  onClick={handleUpgradePayment}
                  className="inline-flex items-center gap-2 rounded-xl bg-helio px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-helio-dark active:scale-95 transition disabled:opacity-70 cursor-pointer"
                >
                  {upgrading ? (
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Zap className="size-4" />
                      <span>Upgrade Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>You have full CH-User application privileges!</span>
              </div>
              <p className="mt-1 text-xs text-emerald-700/80">
                You can browse all templates, launch interactive live demos, and apply directly. Email OTP verification is active on your account.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end pt-3 border-t border-ink/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-ink/20 px-5 py-2 text-sm font-semibold text-ink hover:bg-mist transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}