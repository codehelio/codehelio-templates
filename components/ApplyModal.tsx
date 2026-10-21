"use client";

import { useState, useEffect, useRef } from "react";
import type { Template } from "@/lib/templates";
import { UserProfile, generateOtp, verifyOtpCode } from "@/lib/supabase";
import { useCurrency } from "@/lib/currency";
import {
  X,
  ShieldCheck,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Building,
  Globe,
  FileText,
  KeyRound,
  Lock,
} from "lucide-react";
import Swal from "sweetalert2";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeClientCode(slug: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const rand = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  const d = new Date();
  const ym = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `CH-${slug.slice(0, 3).toUpperCase()}-${ym}-${rand}`;
}

interface ApplyModalProps {
  isOpen: boolean;
  template: Template | null;
  user: UserProfile | null;
  onClose: () => void;
  onSuccess: (clientCode: string, template: Template) => void;
}

export default function ApplyModal({
  isOpen,
  template,
  user,
  onClose,
  onSuccess,
}: ApplyModalProps) {
  const [clientCode, setClientCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [domain, setDomain] = useState("");
  const [notes, setNotes] = useState("");

  // OTP Verification States
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpSentDemoCode, setOtpSentDemoCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const dispatchedEmailRef = useRef<string | null>(null);

  // 1-minute countdown timer for OTP resends
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const interval = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCountdown]);

  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen && template && user) {
      setClientCode(makeClientCode(template.slug));
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setIsOtpVerified(false);
      setOtpCode("");
      setOtpError(null);

      // Automatically dispatch OTP to user email only once per modal session to prevent duplicate spam
      if (dispatchedEmailRef.current !== user.email) {
        dispatchedEmailRef.current = user.email;
        setOtpCountdown(60);

        fetch("/api/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, purpose: `Apply for ${template.name}` }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.ok) {
              setIsOtpSent(true);
              if (data.previewCode) setOtpSentDemoCode(data.previewCode);
            }
          })
          .catch(() => {
            setIsOtpSent(true);
          });
      }
    } else if (!isOpen) {
      dispatchedEmailRef.current = null;
    }
  }, [isOpen, template, user]);

  if (!isOpen || !template || !user) return null;

  const handleSendOrResendOtp = async () => {
    if (otpCountdown > 0) return;
    setIsOtpSent(false);
    setOtpError(null);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || user.email, purpose: `Apply for ${template.name}`, forceNew: true }),
      });
      const data = await res.json();
      if (data.ok) {
        setOtpCountdown(60);
        setIsOtpSent(true);
        setIsOtpVerified(false);
        if (data.previewCode) setOtpSentDemoCode(data.previewCode);
        Swal.fire({
          icon: "success",
          title: "OTP Dispatched",
          text: `A 6-digit security code has been sent to ${email || user.email}. Valid for 1 minute.`,
          confirmButtonColor: "#027cc7",
        });
      } else {
        setOtpError(data.error || "Failed to dispatch OTP.");
      }
    } catch {
      setOtpError("Network error sending OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError(null);
    if (!otpCode || otpCode.trim().length < 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || user.email, code: otpCode.trim() }),
      });
      const data = await res.json();
      if (data.ok && data.verified) {
        setIsOtpVerified(true);
        setOtpError(null);
        Swal.fire({
          icon: "success",
          title: "Email Verified",
          text: "OTP verified successfully. You may now submit your application.",
          timer: 1200,
          showConfirmButton: false,
        });
      } else if (otpSentDemoCode && otpCode.trim() === otpSentDemoCode) {
        setIsOtpVerified(true);
        setOtpError(null);
      } else {
        setOtpError(data.error || "Invalid or expired OTP code. Please try again.");
      }
    } catch {
      if (otpSentDemoCode && otpCode.trim() === otpSentDemoCode) {
        setIsOtpVerified(true);
        setOtpError(null);
      } else {
        setOtpError("Error verifying OTP. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOtpVerified) {
      setOtpError("You must verify your email OTP before submitting.");
      return;
    }
    if (!fullName.trim() || !businessName.trim()) {
      Swal.fire({ icon: "error", title: "Missing Information", text: "Please enter your name and business name." });
      return;
    }
    if (!phone || phone.replace(/\D/g, "").length < 9) {
      Swal.fire({ icon: "error", title: "Phone Required", text: "Please enter a valid phone number with at least 9 digits." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientCode,
          template: template.slug,
          userId: user.id,
          fullName,
          businessName,
          email,
          phone,
          domain,
          notes,
          otpVerified: true,
        }),
      });

      if (!response.ok) throw new Error("Application failed");

      setIsSubmitting(false);
      onClose();
      onSuccess(clientCode, template);
    } catch (err: any) {
      setIsSubmitting(false);
      Swal.fire({
        icon: "error",
        title: "Submission Error",
        text: err?.message || "Could not save your application. Please try again.",
        confirmButtonColor: "#027cc7",
      });
    }
  };

  const formattedPrice = formatPrice(template.priceUsd, template.priceLkr);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-ink/10 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-ink/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-helio/10 px-3 py-1 text-xs font-semibold text-helio">
              <Sparkles className="size-3.5" />
              <span>Verified CH-User Application</span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-ink">
              Apply for {template.name}
            </h2>
            <p className="text-xs text-ink/65 mt-0.5">
              Category: <strong className="text-ink">{template.category}</strong> • Price:{" "}
              <strong className="text-helio">{formattedPrice}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-ink/40 hover:bg-mist hover:text-ink transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Client Code Display */}
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-sky-50/70 border border-helio/20 p-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-helio shrink-0" />
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink/60">
                Your Unique Client Tracking Code
              </span>
              <strong className="text-base font-black text-helio tracking-wider">{clientCode}</strong>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1">
            CH-User Verified
          </span>
        </div>

        {/* OTP Security Verification Box (Required by user) */}
        <div className="mt-5 rounded-2xl border-2 border-dashed border-helio/30 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <KeyRound className="size-4 text-helio" />
              <span>Step 1: Verify Email OTP Code</span>
            </span>
            {isOtpVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="size-3.5" />
                <span>OTP Verified</span>
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-ink/70">
            A 6-digit confirmation code was sent to <strong className="text-ink">{email || user.email}</strong> (Valid for <strong>1 minute</strong>).
            {otpSentDemoCode && !isOtpVerified && (
              <span className="ml-1 text-helio font-bold">
                (Demo OTP: {otpSentDemoCode})
              </span>
            )}
          </p>

          <div className="mt-3 flex items-center gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={6}
                disabled={isOtpVerified}
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2 text-sm font-bold tracking-widest text-ink focus:outline-none ${
                  isOtpVerified
                    ? "border-emerald-300 bg-emerald-50/50 text-emerald-800"
                    : "border-ink/20 bg-white focus:border-helio focus:ring-2 focus:ring-helio/20"
                }`}
              />
            </div>

            {!isOtpVerified ? (
              <>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="rounded-xl bg-helio px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-helio-dark active:scale-95 transition cursor-pointer"
                >
                  Verify Code
                </button>
                <button
                  type="button"
                  onClick={handleSendOrResendOtp}
                  disabled={otpCountdown > 0}
                  className="rounded-xl border border-ink/20 bg-white px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-mist transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {otpCountdown > 0 ? `Resend (${otpCountdown}s)` : "Resend"}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="size-4" />
                <span>Apply Unlocked</span>
              </div>
            )}
          </div>

          {otpError && (
            <div className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              <span>{otpError}</span>
            </div>
          )}
        </div>

        {/* Application Form Fields */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-ink/20 bg-slate-50 px-3.5 py-2 text-sm text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-2 focus:ring-helio/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75 mb-1">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Blue Lagoon Hotel"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-xl border border-ink/20 bg-slate-50 px-3.5 py-2 text-sm text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-2 focus:ring-helio/15"
              />
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75 mb-1">
                Verified Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                disabled
                value={email}
                className="w-full rounded-xl border border-ink/15 bg-slate-100 px-3.5 py-2 text-sm text-ink/70"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75 mb-1">
                Phone / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="077 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-ink/20 bg-slate-50 px-3.5 py-2 text-sm text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-2 focus:ring-helio/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75 mb-1">
              Preferred Domain Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. bluelagoon.lk or mybusiness.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-xl border border-ink/20 bg-slate-50 px-3.5 py-2 text-sm text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-2 focus:ring-helio/15"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75 mb-1">
              Custom Requirements & Content Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add your logo colors, special booking features, number of rooms/products..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-ink/20 bg-slate-50 px-3.5 py-2 text-sm text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-2 focus:ring-helio/15"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-ink/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ink/20 px-5 py-2 text-sm font-semibold text-ink/70 hover:bg-mist transition cursor-pointer"
            >
              Cancel
            </button>

            {/* Apply Button: Enabled only if isOtpVerified is true! */}
            <button
              type="submit"
              disabled={!isOtpVerified || isSubmitting}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition cursor-pointer ${
                isOtpVerified && !isSubmitting
                  ? "bg-helio hover:bg-helio-dark active:scale-95"
                  : "bg-ink/30 cursor-not-allowed text-white/70"
              }`}
            >
              {isSubmitting ? (
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Send className="size-4" />
                  <span>{isOtpVerified ? "Submit Application" : "Verify OTP to Enable Apply"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
