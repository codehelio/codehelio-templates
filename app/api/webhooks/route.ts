import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe"; // <-- Use getStripe instead of stripe
import { recordMembershipPayment } from "@/lib/supabaseServer";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripe(); // <-- Initialize lazily at runtime
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      throw new Error("Missing stripe-signature or STRIPE_WEBHOOK_SECRET");
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json(
      { message: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  const permittedEvents: string[] = ["checkout.session.completed"];

  if (permittedEvents.includes(event.type)) {
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(`CheckoutSession status: ${session.payment_status}`);
          
          await recordMembershipPayment({
            userId: session.metadata?.userId || null,
            userEmail: session.metadata?.userEmail || session.customer_details?.email || session.customer_email || null,
            amount: session.amount_total ? session.amount_total / 100 : 1.82,
            currency: session.currency || "USD",
            transactionRef: session.id,
            paymentMethod: "Stripe",
          });
          break;
        }
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.error("Webhook processing error:", error);
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}