"use client";

import type { Template } from "@/lib/templates";
import { useCurrency } from "@/lib/currency";
import Mockup from "./Mockup";
import { ExternalLink, Sparkles, CheckCircle2, Play } from "lucide-react";

interface TemplateCardProps {
  t: Template;
  index: number;
  onApply: (t: Template) => void;
  onOpenLiveDemo: (t: Template) => void;
}

export default function TemplateCard({
  t,
  index,
  onApply,
  onOpenLiveDemo,
}: TemplateCardProps) {
  const { formatPrice } = useCurrency();
  const displayPrice = formatPrice(t.priceUsd, t.priceLkr);

  return (
    <article
      className="group card-in relative flex flex-col rounded-2xl border border-ink/10 bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(2,124,199,0.3)] hover:border-helio/40"
      style={{ animationDelay: `${index * 50}ms` }}
      suppressHydrationWarning
    >
      {/* Top-Right Price Display (Dynamically formatted in USD / LKR as requested) */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1 text-sm font-bold shadow-lg backdrop-blur-md border border-helio/30">
        <span className="text-[11px] uppercase tracking-wider text-ink/50 font-semibold">From</span>
        <span className="text-base font-extrabold text-helio">{displayPrice}</span>
      </div>

      {/* Top-Left Badge (if available) */}
      {t.badge && (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-1 rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-md backdrop-blur-sm">
          <Sparkles className="size-3 text-amber-300" />
          <span>{t.badge}</span>
        </div>
      )}

      {/* Browser Mockup / Image Preview with Click-to-Demo Overlay */}
      <div
        className="relative overflow-hidden rounded-xl cursor-pointer"
        onClick={() => onOpenLiveDemo(t)}
        title="Click to launch interactive live demo"
      >
        <Mockup t={t} />
        <div className="absolute inset-0 flex items-center justify-center bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3.5 py-1.5 text-xs font-bold text-ink shadow-lg">
            <Play className="size-3 text-helio fill-helio" />
            <span>Launch Live Demo</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-ink tracking-tight group-hover:text-helio transition-colors">
            {t.name}
          </h3>
          <span className="shrink-0 rounded-full bg-mist px-2.5 py-0.5 text-xs font-medium text-ink/70 border border-ink/10">
            {t.category}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-ink/75 line-clamp-2">
          {t.blurb}
        </p>

        {/* Included Pages / Specs */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink/60">
          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
          <span className="truncate">
            <strong className="font-semibold text-ink/70">Pages:</strong> {t.pages}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={() => onApply(t)}
            suppressHydrationWarning
            className="flex-1 rounded-xl bg-helio px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-helio-dark hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            Apply Now
          </button>
          <button
            type="button"
            onClick={() => onOpenLiveDemo(t)}
            suppressHydrationWarning
            className="flex items-center justify-center gap-1.5 rounded-xl border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-200 hover:bg-ink hover:text-white active:scale-[0.98] cursor-pointer"
          >
            <span>Live Demo</span>
            <ExternalLink className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
