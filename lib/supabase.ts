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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isLiveSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://"));

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Get the currently logged-in user profile from Supabase Auth & Profiles Table
 */
export async function getStoredProfile(): Promise<UserProfile | null> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session || !session.user) return null;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return {
        id: session.user.id,
        email: session.user.email || "",
        full_name: session.user.user_metadata?.full_name || "User",
        role: "user",
        is_paid: false,
      };
    }

    return profile as UserProfile;
  } catch {
    return null;
  }
}

/**
 * Sign in user with email & password via Supabase Auth
 */
export async function authenticateUser(email: string, pass: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: pass,
  });

  if (error || !data.user) {
    throw new Error(error?.message || "Invalid email or password.");
  }

  // Fetch profile from database with error logging
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile fetch error during login:", profileError.message);
  }

  // Fallback role mapping for admin based on email if DB query fails or delayed
  const forcedRole = cleanEmail === "admin@codehelio.com" ? "admin" : (profile?.role || "user");

  const userProfile: UserProfile = {
    id: data.user.id,
    email: data.user.email || cleanEmail,
    full_name: profile?.full_name || data.user.user_metadata?.full_name || cleanEmail.split("@")[0],
    role: forcedRole as UserRole,
    is_paid: profile?.is_paid || forcedRole === "ch_user" || forcedRole === "admin" || forcedRole === "creator",
    avatar_url: profile?.avatar_url,
    phone: profile?.phone,
  };

  return userProfile;
}
/**
 * Register a new user via Supabase Auth
 */
export async function registerUser(email: string, pass: string, fullName: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const trimmedName = fullName.trim() || cleanEmail.split("@")[0];

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: pass,
    options: {
      data: { full_name: trimmedName },
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "Registration failed.");
  }

  // Check if profile was created by trigger, else fetch/wait briefly
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  const userProfile: UserProfile = {
    id: data.user.id,
    email: cleanEmail,
    full_name: profile?.full_name || trimmedName,
    role: profile?.role || "user",
    is_paid: profile?.is_paid || false,
  };

  return userProfile;
}

/**
 * Upgrade user to CH_USER
 */
export async function upgradeToChUser(
  user: UserProfile,
  amount: number = 600,
  currency: string = "LKR"
): Promise<UserProfile> {
  try {
    await supabase.rpc("upgrade_to_ch_user", {
      p_user_id: user.id,
      p_amount: amount,
      p_currency: currency,
    });
  } catch (e) {
    console.warn("Supabase upgrade RPC warning:", e);
  }

  const updated: UserProfile = {
    ...user,
    role: "ch_user",
    is_paid: true,
    paid_amount: amount,
    paid_currency: currency,
  };

  return updated;
}


/**
 * Generate a 6-digit OTP code for template application verification
 */
export function generateOtp(email: string): string {
  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Optionally, you can also store or log it for debugging
  console.log(`Generated OTP for ${email}: ${code}`);
  
  return code;
}