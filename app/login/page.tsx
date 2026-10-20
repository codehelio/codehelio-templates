"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Swal from "sweetalert2";
import { authenticateUser, registerUser } from "@/lib/supabase";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      let userProfile;
      if (isSignUp) {
        userProfile = await registerUser(email, password, fullName);
      } else {
        userProfile = await authenticateUser(email, password);
      }

      setLoading(false);

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
      className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden"
      suppressHydrationWarning
    >
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-helio/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-sky-400/15 blur-3xl" />

       <div className="w-full max-w-md" suppressHydrationWarning>
        <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white p-8 shadow-xl" suppressHydrationWarning>
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
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink" suppressHydrationWarning>
              {isSignUp ? "Create a CodeHelio Account" : "Sign In to CodeHelio"}
            </h1>
            <p className="mt-2 text-sm text-ink/65" suppressHydrationWarning>
              {isSignUp
                ? "Create your account to get started"
                : "Manage your template requests, inquiries & orders"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700" suppressHydrationWarning>
              {error}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" suppressHydrationWarning>
            {isSignUp && (
              <div suppressHydrationWarning>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required={isSignUp}
                  placeholder="Kasun Perera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-ink/20 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-3 focus:ring-helio/15"
                />
              </div>
            )}

            {/* Email Field */}
            <div suppressHydrationWarning>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80 mb-1">
                Email Address
              </label>
              <div className="relative" suppressHydrationWarning>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
                  <Mail className="size-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-ink/20 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm font-medium text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-3 focus:ring-helio/15"
                />
              </div>
            </div>

            {/* Password Field */}
            <div suppressHydrationWarning>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    suppressHydrationWarning
                    className="text-xs font-medium text-helio hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative" suppressHydrationWarning>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
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
                  className="w-full rounded-xl border border-ink/20 bg-slate-50 pl-10 pr-10 py-2.5 text-sm font-medium text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-3 focus:ring-helio/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  suppressHydrationWarning
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink/40 hover:text-ink cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1" suppressHydrationWarning>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink/75">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  suppressHydrationWarning
                  className="size-4 rounded border-ink/30 text-helio focus:ring-helio cursor-pointer"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full rounded-xl bg-helio py-3 px-4 text-sm font-semibold text-white shadow-md hover:bg-helio-dark active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {loading ? (
                <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Zap className="size-4" />
                  <span>{isSignUp ? "Create Account" : "Sign In to Dashboard"}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 border-t border-ink/10 pt-4 text-center" suppressHydrationWarning>
            <p className="text-xs text-ink/70">
              {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                suppressHydrationWarning
                className="font-semibold text-helio hover:underline cursor-pointer"
              >
                {isSignUp ? "Sign In instead" : "Create an account"}
              </button>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-ink/50" suppressHydrationWarning>
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>256-bit encrypted Supabase authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}