import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body.email;
    const rawCode = body.code;

    if (!rawEmail || !rawCode) {
      return NextResponse.json(
        { ok: false, error: "Email and OTP code are required." },
        { status: 400 }
      );
    }

    const email = String(rawEmail).trim().toLowerCase();
    const code = String(rawCode).trim();

    // Query active unused OTP record from otp_verifications table
    const { data: record, error } = await supabaseAdmin
      .from("otp_verifications")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Database query error in OTP verify:", error.message);
      return NextResponse.json(
        { ok: false, error: "Verification failed: " + error.message },
        { status: 500 }
      );
    }

    if (!record) {
      // Increment attempt count on any existing pending code for security audit
      await supabaseAdmin
        .from("otp_verifications")
        .update({ attempts: 1 })
        .eq("email", email)
        .eq("is_used", false);

      return NextResponse.json(
        { ok: false, error: "Invalid or expired OTP code. Please try again." },
        { status: 400 }
      );
    }

    // Mark as used
    const { error: updateError } = await supabaseAdmin
      .from("otp_verifications")
      .update({ is_used: true })
      .eq("id", record.id);

    if (updateError) {
      console.warn("Could not mark OTP as used:", updateError.message);
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      message: "OTP successfully verified.",
    });
  } catch (err: any) {
    console.error("Error in /api/otp/verify:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to verify OTP." },
      { status: 500 }
    );
  }
}
