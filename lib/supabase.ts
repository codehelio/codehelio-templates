import { createClient } from "@supabase/supabase-js";

export type UserRole = "admin" | "creator" | "ch_user" | "user";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_paid: boolean;
  avatar_url?: string;
  phone?: string;
  paid_amount?: number;
  paid_currency?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xyzcompany.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";

export const isLiveSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://") &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("xyzcompany"));

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// In-built Default Users from environment or defaults
export const INBUILT_ADMIN = {
  id: "admin-inbuilt-001",
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@codehelio.com",
  full_name: process.env.NEXT_PUBLIC_ADMIN_NAME || "CodeHelio Administrator",
  role: "admin" as UserRole,
  is_paid: true,
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
};

export const INBUILT_CREATOR = {
  id: "creator-inbuilt-002",
  email: process.env.NEXT_PUBLIC_CREATOR_EMAIL || "creator@codehelio.com",
  full_name: process.env.NEXT_PUBLIC_CREATOR_NAME || "CodeHelio Studio Creator",
  role: "creator" as UserRole,
  is_paid: true,
  avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
};

/**
 * Get the currently logged-in user profile
 */
export function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("codehelio_auth_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save user profile in storage
 */
export function setStoredProfile(profile: UserProfile | null): void {
  if (typeof window === "undefined") return;
  if (!profile) {
    localStorage.removeItem("codehelio_auth_user");
  } else {
    localStorage.setItem("codehelio_auth_user", JSON.stringify(profile));
  }
}

/**
 * Sign in user with email & password
 */
export async function authenticateUser(email: string, pass: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();

  // Check In-built Admin user
  if (cleanEmail === INBUILT_ADMIN.email.toLowerCase()) {
    setStoredProfile(INBUILT_ADMIN);
    return INBUILT_ADMIN;
  }

  // Check In-built Creator user
  if (cleanEmail === INBUILT_CREATOR.email.toLowerCase()) {
    setStoredProfile(INBUILT_CREATOR);
    return INBUILT_CREATOR;
  }

  // Check Supabase Auth if connected
  if (isLiveSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });
      if (error) throw error;
      if (data.user) {
        // Fetch profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        const role: UserRole = prof?.role || "user";
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          full_name: prof?.full_name || data.user.user_metadata?.full_name || cleanEmail.split("@")[0],
          role,
          is_paid: prof?.is_paid || role === "ch_user",
        };
        setStoredProfile(profile);
        return profile;
      }
    } catch (e: any) {
      console.warn("Supabase auth error, falling back to local session:", e.message);
    }
  }

  // Local user fallback: default role is "user"
  // Check if previously upgraded in local storage
  let savedRole: UserRole = "user";
  let isPaid = false;
  try {
    const customProfiles = JSON.parse(localStorage.getItem("codehelio_registered_users") || "{}");
    if (customProfiles[cleanEmail]) {
      savedRole = customProfiles[cleanEmail].role || "user";
      isPaid = Boolean(customProfiles[cleanEmail].is_paid);
    }
  } catch {
    // ignore
  }

  const profile: UserProfile = {
    id: `user-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`,
    email: cleanEmail,
    full_name: cleanEmail.split("@")[0],
    role: savedRole,
    is_paid: isPaid,
  };
  setStoredProfile(profile);
  return profile;
}

/**
 * Register a new user
 */
export async function registerUser(email: string, pass: string, fullName: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();

  // Default role for any new sign-up is strictly "user" (normal user)
  const role: UserRole = "user";

  const profile: UserProfile = {
    id: `user-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`,
    email: cleanEmail,
    full_name: fullName.trim() || cleanEmail.split("@")[0],
    role: "user",
    is_paid: false,
  };

  // If live Supabase is configured
  if (isLiveSupabaseConfigured) {
    try {
      await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: { full_name: profile.full_name },
        },
      });
    } catch (e) {
      console.warn("Supabase sign up warning:", e);
    }
  }

  // Save in local registered users
  try {
    const customProfiles = JSON.parse(localStorage.getItem("codehelio_registered_users") || "{}");
    customProfiles[cleanEmail] = profile;
    localStorage.setItem("codehelio_registered_users", JSON.stringify(customProfiles));
  } catch {
    // ignore
  }

  setStoredProfile(profile);
  return profile;
}

/**
 * Upgrade user to CH_USER after paying LKR 600 / USD 1.82
 */
export async function upgradeToChUser(
  user: UserProfile,
  amount: number = 600,
  currency: string = "LKR"
): Promise<UserProfile> {
  const updated: UserProfile = {
    ...user,
    role: "ch_user",
    is_paid: true,
    paid_amount: amount,
    paid_currency: currency,
  };

  // Update in live Supabase if connected
  if (isLiveSupabaseConfigured) {
    try {
      await supabase.rpc("upgrade_to_ch_user", {
        p_user_id: user.id,
        p_amount: amount,
        p_currency: currency,
      });
    } catch (e) {
      console.warn("Supabase upgrade RPC warning:", e);
    }
  }

  // Update in local profiles
  try {
    const customProfiles = JSON.parse(localStorage.getItem("codehelio_registered_users") || "{}");
    customProfiles[user.email.toLowerCase()] = updated;
    localStorage.setItem("codehelio_registered_users", JSON.stringify(customProfiles));
  } catch {
    // ignore
  }

  setStoredProfile(updated);
  return updated;
}

/**
 * Generate and send OTP for verification
 */
export function generateOtp(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const otps = JSON.parse(localStorage.getItem("codehelio_otps") || "{}");
    otps[email.toLowerCase()] = {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };
    localStorage.setItem("codehelio_otps", JSON.stringify(otps));
  } catch {
    // ignore
  }
  return code;
}

/**
 * Verify OTP
 */
export function verifyOtpCode(email: string, inputCode: string): boolean {
  try {
    const otps = JSON.parse(localStorage.getItem("codehelio_otps") || "{}");
    const record = otps[email.toLowerCase()];
    if (!record) return false;
    if (Date.now() > record.expiresAt) return false;
    return record.code.trim() === inputCode.trim();
  } catch {
    return false;
  }
}
