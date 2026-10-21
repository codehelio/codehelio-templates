import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!serviceRoleKey) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.");
}

/**
 * Service Role Client that bypasses Supabase Row Level Security (RLS) safely on the server.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface RecordPaymentParams {
  userId?: string | null;
  userEmail?: string | null;
  amount: number;
  currency: string;
  transactionRef: string;
  paymentMethod?: string;
}

/**
 * Record a completed membership payment and upgrade user profile to CH_USER
 * Runs with service_role key to bypass RLS.
 */
export async function recordMembershipPayment({
  userId,
  userEmail,
  amount,
  currency,
  transactionRef,
  paymentMethod = "Stripe",
}: RecordPaymentParams) {
  try {
    let resolvedUserId = userId;

    // If userId not provided directly, try looking up profile by email
    if (!resolvedUserId && userEmail) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", userEmail.trim().toLowerCase())
        .maybeSingle();

      if (profile?.id) {
        resolvedUserId = profile.id;
      }
    }

    // 1. Insert into membership_payments table
    const { error: paymentError } = await supabaseAdmin
      .from("membership_payments")
      .insert({
        user_id: resolvedUserId || null,
        amount: Number(amount) || 1.82,
        currency: currency.toUpperCase(),
        payment_method: paymentMethod,
        transaction_ref: transactionRef,
        status: "completed",
        created_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error("Error inserting membership_payments record:", paymentError.message);
    } else {
      console.log(`Payment record inserted for ref: ${transactionRef}`);
    }

    // 2. If a user is identified, elevate profile to ch_user
    if (resolvedUserId) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({
          role: "ch_user",
          is_paid: true,
          paid_amount: Number(amount) || 1.82,
          paid_currency: currency.toUpperCase(),
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", resolvedUserId);

      if (profileError) {
        console.error("Error updating profile to ch_user:", profileError.message);
      } else {
        console.log(`Profile ${resolvedUserId} elevated to CH-User successfully.`);
      }
    } else if (userEmail) {
      // Fallback: update profile by email
      const { error: profileEmailError } = await supabaseAdmin
        .from("profiles")
        .update({
          role: "ch_user",
          is_paid: true,
          paid_amount: Number(amount) || 1.82,
          paid_currency: currency.toUpperCase(),
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("email", userEmail.trim().toLowerCase());

      if (profileEmailError) {
        console.error("Error updating profile by email:", profileEmailError.message);
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Exception in recordMembershipPayment:", err);
    return { success: false, error: err };
  }
}

export interface SaveApplicationParams {
  clientCode: string;
  templateSlug: string;
  userId?: string | null;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  domain?: string | null;
  notes?: string | null;
  otpVerified?: boolean;
}

/**
 * Save a template application into template_applications table (bypassing RLS)
 */
export async function saveTemplateApplication(params: SaveApplicationParams) {
  const { data, error } = await supabaseAdmin
    .from("template_applications")
    .insert({
      client_code: params.clientCode,
      template_slug: params.templateSlug,
      user_id: params.userId || null,
      full_name: params.fullName,
      business_name: params.businessName,
      email: params.email.trim().toLowerCase(),
      phone: params.phone,
      domain: params.domain || null,
      notes: params.notes || null,
      otp_verified: params.otpVerified ?? true,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert template_applications:", error.message);
    throw new Error(error.message);
  }

  return data;
}
