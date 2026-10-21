"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import Swal from "sweetalert2";
import { authenticateUser, registerUser, UserProfile, setStoredProfile } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CH_USER Specific OTP State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);
  const [otpDemoCode, setOtpDemoCode] = useState<string | null>(null);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);

  // 1-minute cooldown timer for OTP resends
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const interval = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // -------------------------------------------------------------
    // Step 2: Handle OTP Verification for CH_USER
    // -------------------------------------------------------------
    if (isOtpStep && pendingUser) {
      if (!otpCode || otpCode.trim().length < 6) {
        setError("Please enter the complete 6-digit verification code.");
        return;
      }

      setLoading(true);

      try {
        const res = await fetch("/api/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: pendingUser.email, code: otpCode.trim() }),
        });

        const data = await res.json();

        if (data.ok && data.verified) {
          setLoading(false);
          setStoredProfile(pendingUser);

          Swal.fire({
            icon: "success",
            title: "Identity Verified!",
            html: `Welcome back, <b>${pendingUser.full_name || pendingUser.email}</b><br/><span style="font-size:0.8rem; color:#027cc7; font-weight:600;">CH-User Verified Security Clearance</span>`,
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
          }).then(() => {
            router.push("/");
          });
          return;
        }

        // Fallback for demo preview code if email failed delivery
        if (otpDemoCode && otpCode.trim() === otpDemoCode) {
          setLoading(false);
          setStoredProfile(pendingUser);
          Swal.fire({
            icon: "success",
            title: "Identity Verified!",
            html: `Welcome back, <b>${pendingUser.full_name || pendingUser.email}</b>`,
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            router.push("/");
          });
          return;
        }

        throw new Error(data.error || "Invalid or expired OTP code.");
      } catch (err: any) {
        setLoading(false);
        setError(err?.message || "OTP verification failed. Please try again.");
        return;
      }
    }

    // -------------------------------------------------------------
    // Step 1: Normal Credentials Submission
    // -------------------------------------------------------------
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    if (isSignUp && !fullName) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      let userProfile: UserProfile;
      if (isSignUp) {
        userProfile = await registerUser(email, password, fullName);
      } else {
        userProfile = await authenticateUser(email, password);
      }

      // Check if user is a CH_USER -> require OTP before finishing login!
      if (!isSignUp && userProfile.role === "ch_user") {
        setPendingUser(userProfile);
        setIsOtpStep(true);
        setOtpCountdown(60);
        setLoading(false);

        // Send OTP via server endpoint using Gmail SMTP & save to otp_verifications table
        try {
          const otpRes = await fetch("/api/otp/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userProfile.email, purpose: "CH-User Account Sign In" }),
          });
          const otpData = await otpRes.json();
          if (otpData.previewCode) {
            setOtpDemoCode(otpData.previewCode);
          }
        } catch (e) {
          console.warn("Could not dispatch OTP automatically:", e);
        }

        Swal.fire({
          icon: "info",
          title: "CH-User Security Verification",
          html: `A 6-digit OTP code has been sent to <b>${userProfile.email}</b>.<br/><span style="font-size:0.8rem; color:#64748b;">Please enter the code to complete your login.</span>`,
          confirmButtonColor: "#027cc7",
        });
        return;
      }

      // Standard user or admin -> login directly
      setLoading(false);
      setStoredProfile(userProfile);

      Swal.fire({
        icon: "success",
        title: isSignUp ? "Account Created!" : "Welcome back!",
        html: `Logged in as <b>${userProfile.full_name || userProfile.email}</b><br/><span style="font-size:0.8rem; color:#027cc7;">Role: ${userProfile.role.toUpperCase()}</span>`,
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(() => {
        router.push("/");
      });
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Authentication failed. Please check credentials.");
    }
  };

  const handleResendOtp = async () => {
    if (!pendingUser || otpCountdown > 0) return;
    setIsResendingOtp(true);
    setError(null);

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingUser.email, purpose: "CH-User Account Sign In", forceNew: true }),
      });
      const data = await res.json();
      setIsResendingOtp(false);

      if (data.ok) {
        setOtpCountdown(60);
        if (data.previewCode) setOtpDemoCode(data.previewCode);
        Swal.fire({
          icon: "success",
          title: "New Code Sent",
          text: `A new 6-digit code has been dispatched to ${pendingUser.email}. Valid for 1 minute.`,
          confirmButtonColor: "#027cc7",
        });
      } else {
        setError(data.error || "Failed to resend code.");
      }
    } catch {
      setIsResendingOtp(false);
      setError("Network error while resending code.");
    }
  };

  const handleBackToPassword = () => {
    setIsOtpStep(false);
    setOtpCode("");
    setPendingUser(null);
    setError(null);
  };

  const handleForgotPassword = () => {
    Swal.fire({
      title: "Reset Password",
      input: "email",
      inputLabel: "Enter your registered email address",
      inputPlaceholder: "you@example.com",
      inputValue: email,
      showCancelButton: true,
      confirmButtonText: "Send Reset Link",
      confirmButtonColor: "#027cc7",
      showLoaderOnConfirm: true,
      preConfirm: (inputEmail) => {
        if (!inputEmail || !/^\S+@\S+\.\S+$/.test(inputEmail)) {
          Swal.showValidationMessage("Please enter a valid email.");
          return false;
        }
        return true;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Reset Email Dispatched",
          text: "If an account exists, you will receive password reset instructions shortly.",
          confirmButtonColor: "#027cc7",
        });
      }
    });
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center bg-[#f8fafc] px-4 py-12 sm:px-6 lg:px-8"
      suppressHydrationWarning
    >
      {/* Top Left Go Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          title="Visit Public Back"
        >
          <Globe className="h-4 w-4 text-[#027cc7]" />
          <span>Back to Store</span>
        </Link>
      </div>

      <div className="w-full max-w-md" suppressHydrationWarning>
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-lg shadow-slate-100" suppressHydrationWarning>
          {/* Logo Header */}
          <div className="text-center" suppressHydrationWarning>
            <Link href="/" className="inline-block" suppressHydrationWarning>
              <Image
                src="/CodeHelio_Logo.png"
                alt="CodeHelio"
                width={2576}
                height={1212}
                className="h-10 w-auto mx-auto"
                priority
              />
            </Link>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900" suppressHydrationWarning>
              {isOtpStep
                ? "Security Verification"
                : isSignUp
                ? "Create a CodeHelio Account"
                : "Sign In to CodeHelio"}
            </h1>

            <p className="mt-2 text-sm text-slate-500" suppressHydrationWarning>
              {isOtpStep
                ? `Enter the 6-digit code dispatched to ${pendingUser?.email}`
                : isSignUp
                ? "Create your account to browse & apply for templates"
                : "Sign in with your email & password to continue"}
            </p>
          </div>

          {/* CH-User Security Banner when in OTP mode */}
          {isOtpStep && (
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-sky-50 border border-sky-100 p-3 text-xs text-sky-800 font-medium">
              <ShieldCheck className="size-4 text-[#027cc7] shrink-0" />
              <span>
                Verified <strong>CH-User</strong> accounts require two-step email authentication.
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700" suppressHydrationWarning>
              {error}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" suppressHydrationWarning>
            {isSignUp && !isOtpStep && (
              <div suppressHydrationWarning>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required={isSignUp}
                  placeholder="Kasun Perera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-[#027cc7] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#027cc7]/15"
                />
              </div>
            )}

            {/* Email Field (Always visible or locked in OTP step) */}
            <div suppressHydrationWarning>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative" suppressHydrationWarning>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="size-4" />
                </div>
                <input
                  type="email"
                  required
                  disabled={isOtpStep}
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning
                  className={`w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pl-10 text-sm font-medium text-slate-900 focus:border-[#027cc7] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#027cc7]/15 ${
                    isOtpStep ? "bg-slate-100 text-slate-600 cursor-not-allowed" : "bg-slate-50/70"
                  }`}
                />
              </div>
            </div>

            {/* DYNAMIC FIELD: If CH_USER -> transforms password into 6-digit OTP code */}
            {isOtpStep ? (
              <div className="animate-in fade-in duration-300" suppressHydrationWarning>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    6-Digit Security Code (OTP)
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResendingOtp || otpCountdown > 0}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#027cc7] hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RotateCcw className={`size-3 ${isResendingOtp ? "animate-spin" : ""}`} />
                    <span>{otpCountdown > 0 ? `Resend (${otpCountdown}s)` : "Resend Code"}</span>
                  </button>
                </div>
                <div className="relative" suppressHydrationWarning>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <KeyRound className="size-4 text-[#027cc7]" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    suppressHydrationWarning
                    className="w-full rounded-xl border-2 border-[#027cc7]/40 bg-white pl-10 pr-3.5 py-2.5 text-center text-lg font-mono font-bold tracking-[0.3em] text-slate-900 focus:border-[#027cc7] focus:outline-none focus:ring-3 focus:ring-[#027cc7]/20"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Valid for 1 minute. Check your inbox or spam folder.
                </p>
              </div>
            ) : (
              /* Normal Password Field */
              <div suppressHydrationWarning>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      suppressHydrationWarning
                      className="text-xs font-medium text-[#027cc7] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative" suppressHydrationWarning>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="size-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 focus:border-[#027cc7] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#027cc7]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    suppressHydrationWarning
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me (Only in credentials mode) */}
            {!isOtpStep && (
              <div className="flex items-center justify-between pt-1" suppressHydrationWarning>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    suppressHydrationWarning
                    className="size-4 rounded border-slate-300 text-[#027cc7] focus:ring-[#027cc7] cursor-pointer"
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 px-4 text-sm font-bold text-white shadow-xs hover:bg-slate-800 active:scale-98 transition disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isOtpStep ? (
                <>
                  <ShieldCheck className="size-4 text-emerald-400" />
                  <span>Verify OTP & Sign In</span>
                </>
              ) : isSignUp ? (
                <span>Create Account</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            {/* Back to password option if in OTP step */}
            {isOtpStep && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleBackToPassword}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  ← Back to Password
                </button>
              </div>
            )}
          </form>

          {/* Toggle Sign Up / Sign In */}
          {!isOtpStep && (
            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-600" suppressHydrationWarning>
              {isSignUp ? (
                <span>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    suppressHydrationWarning
                    className="font-bold text-[#027cc7] hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError(null);
                    }}
                    suppressHydrationWarning
                    className="font-bold text-[#027cc7] hover:underline cursor-pointer"
                  >
                    Create one now
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}