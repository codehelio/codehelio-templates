import HomeClient from "@/components/HomeClient";
import { ShieldCheck, CreditCard } from "lucide-react";

interface IndexPageProps {
  searchParams: Promise<{ canceled?: string }>;
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const { canceled } = await searchParams;

  if (canceled) {
    console.log(
      'Order canceled -- continue to shop around and check out when you\'re ready.'
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#fafbfc] text-[#2d3748]" suppressHydrationWarning>
      {/* Natural, Harmonious Stripe Checkout Announcement Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2.5 text-xs shadow-xs" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3" suppressHydrationWarning>
          <div className="flex items-center gap-2.5" suppressHydrationWarning>
            <span className="flex size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
            <span className="text-slate-600 font-medium">
              <strong className="text-slate-900 font-semibold">Stripe Checkout Active:</strong> Upgrade to Verified CH-User ($1.82 USD / LKR 600)
            </span>
          </div>

          <form action="/api/checkout_sessions" method="POST" suppressHydrationWarning>
            <section suppressHydrationWarning>
              <button
                type="submit"
                role="link"
                suppressHydrationWarning
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 text-xs shadow-xs hover:shadow-sm transition active:scale-95 cursor-pointer"
              >
                <CreditCard className="size-3.5 text-slate-300" />
                <span>Checkout</span>
                <span className="text-[11px] font-normal text-slate-400">($1.82)</span>
              </button>
            </section>
          </form>
        </div>
      </div>

      {/* Canceled Notice Bar */}
      {canceled && (
        <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-800 font-medium">
          Order canceled -- continue to shop around and check out when you&apos;re ready.
        </div>
      )}

      {/* Main CodeHelio Application */}
      <HomeClient canceled={Boolean(canceled)} />
    </main>
  );
}
