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
      className="group card-in relative flex w-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:border-helio/40 hover:shadow-[0_20px_45px_-15px_rgba(2,124,199,0.3)]"
      style={{ animationDelay: `${index * 50}ms` }}
      suppressHydrationWarning
    >
      {/* Top Media / Preview Container */}
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-100">
        
        {/* Top Badges overlay - Responsive spacing inside preview image */}
        <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between gap-1.5 pointer-events-none">
          {/* Top-Left Badge (if available) */}
          {t.badge ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-ink/90 px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-white shadow-md backdrop-blur-md">
              <Sparkles className="size-3 text-amber-300" />
              <span className="truncate">{t.badge}</span>
            </div>
          ) : (
            <div />
          )}

          {/* Top-Right Price Display */}
          <div className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-ink shadow-md backdrop-blur-md border border-helio/20">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-ink/50 font-semibold">From</span>
            <span className="font-extrabold text-helio">{displayPrice}</span>
          </div>
        </div>

        {/* Browser Mockup / Image Preview */}
        <div
          className="relative cursor-pointer w-full overflow-hidden"
          onClick={() => onOpenLiveDemo(t)}
          title="Click to launch interactive live demo"
        >
          <Mockup t={t} />
          
          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3.5 py-1.5 text-xs font-bold text-ink shadow-lg">
              <Play className="size-3 text-helio fill-helio" />
              <span>Launch Live Demo</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col pt-3 sm:pt-4">
        
        {/* Title & Category */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-bold text-ink tracking-tight group-hover:text-helio transition-colors truncate max-w-[200px] sm:max-w-none">
            {t.name}
          </h3>
          <span className="shrink-0 rounded-full bg-mist px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-ink/70 border border-ink/10">
            {t.category}
          </span>
        </div>

        {/* Short Description / Blurb */}
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink/75 line-clamp-2">
          {t.blurb}
        </p>

        {/* Included Pages / Specs */}
        <div className="mt-3 flex items-start gap-1.5 text-xs text-ink/60">
          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <span className="line-clamp-1">
            <strong className="font-semibold text-ink/80">Pages:</strong> {t.pages}
          </span>
        </div>

        {/* Action Buttons - Fully Responsive Stacking */}
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => onApply(t)}
            suppressHydrationWarning
            className="w-full sm:flex-1 rounded-xl bg-helio px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-helio-dark active:scale-[0.98] cursor-pointer text-center"
          >
            Apply Now
          </button>
          
          <button
            type="button"
            onClick={() => onOpenLiveDemo(t)}
            suppressHydrationWarning
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-ink/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink transition-all duration-200 hover:bg-ink hover:text-white active:scale-[0.98] cursor-pointer"
          >
            <span>Live Demo</span>
            <ExternalLink className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}