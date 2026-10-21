import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body.email;
    const purpose = body.purpose || "Sign In Verification";
    const forceNew = Boolean(body.forceNew);

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { ok: false, error: "Valid email is required." },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();

    // Check if an active, unused OTP was already created recently (within the last 45s)
    // to prevent duplicate emails from being spammed repeatedly
    if (!forceNew) {
      const { data: recentOtp } = await supabaseAdmin
        .from("otp_verifications")
        .select("*")
        .eq("email", email)
        .eq("is_used", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentOtp) {
        const ageSeconds = (Date.now() - new Date(recentOtp.created_at).getTime()) / 1000;
        if (ageSeconds < 45) {
          console.log(`Active OTP already sent to ${email} ${Math.round(ageSeconds)}s ago. Skipping duplicate email.`);
          return NextResponse.json({
            ok: true,
            message: `An active OTP code was already dispatched to ${email}.`,
            alreadySent: true,
            previewCode: process.env.NODE_ENV === "development" ? recentOtp.code : undefined,
          });
        }
      }
    }

    // Invalidate any previous unused OTPs for this email before generating a new one
    await supabaseAdmin
      .from("otp_verifications")
      .update({ is_used: true })
      .eq("email", email)
      .eq("is_used", false);

    // Generate random 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Valid for 1 MINUTE (60,000 milliseconds) as requested by user
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000).toISOString();

    // Insert into otp_verifications table using service role client (bypassing RLS)
    const { error: dbError } = await supabaseAdmin
      .from("otp_verifications")
      .insert({
        email,
        code,
        expires_at: expiresAt,
        is_used: false,
        attempts: 0,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Failed to insert OTP in database:", dbError.message);
      return NextResponse.json(
        { ok: false, error: "Database error while generating OTP: " + dbError.message },
        { status: 500 }
      );
    }

    // Send email using Gmail SMTP
    const emailResult = await sendOtpEmail(email, code, purpose);

    return NextResponse.json({
      ok: true,
      message: `OTP dispatched to ${email}`,
      emailSent: emailResult.success,
      previewCode: process.env.NODE_ENV === "development" ? code : undefined,
    });
  } catch (err: any) {
    console.error("Error in /api/otp/send:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to dispatch OTP." },
      { status: 500 }
    );
  }
}
