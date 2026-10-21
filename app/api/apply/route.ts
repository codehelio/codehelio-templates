import { NextRequest, NextResponse } from "next/server";
import { saveTemplateApplication } from "@/lib/supabaseServer";
import { sendApplicationConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const b = await req.json().catch(() => null);

    if (
      !b?.fullName ||
      !b.businessName ||
      !b.email ||
      !b.phone ||
      !b.clientCode ||
      !b.template
    ) {
      return NextResponse.json(
        { ok: false, error: "Please provide all required fields." },
        { status: 400 }
      );
    }

    // Save record to template_applications table (bypasses RLS)
    const savedRecord = await saveTemplateApplication({
      clientCode: b.clientCode,
      templateSlug: b.template,
      userId: b.userId || null,
      fullName: b.fullName,
      businessName: b.businessName,
      email: b.email,
      phone: b.phone,
      domain: b.domain || null,
      notes: b.notes || null,
      otpVerified: b.otpVerified ?? true,
    });

    console.log("Template application saved to database successfully:", savedRecord.id);

    // Send confirmation email asynchronously
    sendApplicationConfirmationEmail(b.email, b.clientCode, b.template).catch((e) => {
      console.warn("Could not dispatch confirmation email:", e);
    });

    return NextResponse.json({
      ok: true,
      clientCode: b.clientCode,
      recordId: savedRecord.id,
    });
  } catch (error: any) {
    console.error("Error in /api/apply:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to process application." },
      { status: 500 }
    );
  }
}
