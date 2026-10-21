import { redirect } from "next/navigation";
import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import { recordMembershipPayment } from "@/lib/supabaseServer";
import { CheckCircle2, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function Success({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full text-center bg-slate-800/80 p-8 rounded-3xl border border-slate-700 shadow-xl">
          <p className="text-rose-400 font-semibold mb-2">Missing Session ID</p>
          <p className="text-sm text-slate-400 mb-6">
            No valid checkout session identifier was detected.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  let session;
  try {
    // Initialize Stripe lazily here only when session_id is present
    const stripe = getStripe();
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "payment_intent"],
    });
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full text-center bg-slate-800/80 p-8 rounded-3xl border border-slate-700 shadow-xl">
          <p className="text-rose-400 font-semibold mb-2">Session Not Found</p>
          <p className="text-sm text-slate-400 mb-6">
            Unable to verify this checkout session with Stripe.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (session.status === "open") {
    return redirect("/");
  }

  // Automatically record membership payment into Supabase and elevate user profile
  if (session.status === "complete") {
    try {
      await recordMembershipPayment({
        userId: session.metadata?.userId || null,
        userEmail: session.metadata?.userEmail || session.customer_details?.email || session.customer_email || null,
        amount: session.amount_total ? session.amount_total / 100 : 1.82,
        currency: session.currency || "USD",
        transactionRef: session.id,
        paymentMethod: "Stripe",
      });
    } catch (e) {
      console.error("Could not record payment from success page:", e);
    }
  }

  const customerEmail =
    session.customer_details?.email ||
    session.customer_email ||
    "your registered email";
  const amountTotal = session.amount_total
    ? (session.amount_total / 100).toFixed(2)
    : "1.82";
  const currencyUpper = (session.currency || "USD").toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4 sm:p-6">
      <div className="w-full max-w-lg rounded-3xl bg-slate-800/90 border border-slate-700/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 size-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center">
          {/* Success Check Icon */}
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10 mb-6">
            <CheckCircle2 className="size-9 stroke-[2.5]" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 mb-3">
            <ShieldCheck className="size-3.5" />
            <span>Stripe Payment Confirmed</span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Thank you for your purchase!
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Your transaction was completed successfully. A receipt has been sent to{" "}
            <span className="font-semibold text-sky-400">{customerEmail}</span>.
          </p>

          {/* Details Card */}
          <div className="mt-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4 text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Paid</span>
              <span className="text-sm font-bold text-emerald-400">
                {currencyUpper} {amountTotal}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Status</span>
              <span className="font-medium text-emerald-400 capitalize">
                {session.payment_status || "Paid"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Session ID</span>
              <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                {session.id}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-6 py-3 text-sm font-bold shadow-lg shadow-sky-500/25 transition active:scale-95"
            >
              <ShoppingBag className="size-4" />
              <span>Back to Templates</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}