import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const origin =
      headersList.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    // Attempt to parse any custom body data if passed via JSON or form submission
    let bodyData: Record<string, string> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        bodyData = await req.json();
      } catch (_) {}
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      try {
        const formData = await req.formData();
        formData.forEach((value, key) => {
          bodyData[key] = String(value);
        });
      } catch (_) {}
    }

    const itemName = bodyData.name || "CodeHelio CH-User Membership";
    const itemDescription =
      bodyData.description ||
      "Verified CH-User Upgrade: Access to live template applications & developer deployment.";
    const amountInCents = bodyData.amount
      ? Math.round(Number(bodyData.amount) * 100)
      : 182; // Default to $1.82 USD (LKR ~600)
    const currency = (bodyData.currency || "usd").toLowerCase();

    const userId = bodyData.userId || "";
    const userEmail = bodyData.userEmail || "";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: itemName,
              description: itemDescription,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: userEmail || undefined,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        userId,
        userEmail,
        item_name: itemName,
        source: "codehelio_templates",
      },
    });

    if (!session.url) {
      throw new Error("Failed to generate Stripe checkout URL.");
    }

    // If client requested JSON (e.g. AJAX / fetch)
    const acceptHeader = req.headers.get("accept") || "";
    if (contentType.includes("application/json") || acceptHeader.includes("application/json")) {
      return NextResponse.json({ url: session.url, id: session.id });
    }

    // Direct form POST submission redirect
    return NextResponse.redirect(session.url, 303);
  } catch (err: unknown) {
    const error = err as { message?: string; statusCode?: number };
    console.error("Stripe Checkout Session Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: error.statusCode || 500 }
    );
  }
}
