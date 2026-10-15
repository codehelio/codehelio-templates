"use client";

import type { Template } from "@/lib/templates";
import { openApply } from "@/lib/apply";
import Mockup from "./Mockup";
import { ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";

export default function TemplateCard({ t, index }: { t: Template; index: number }) {
  return (
    <article
      className="group card-in relative flex flex-col rounded-2xl border border-ink/10 bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(2,124,199,0.3)] hover:border-helio/40"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top-Right Price Display (Required by user) */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1 text-sm font-bold shadow-lg backdrop-blur-md border border-helio/30">
        <span className="text-xs uppercase tracking-wider text-ink/50">From</span>
        <span className="text-base font-extrabold text-helio">{t.price}</span>
      </div>

      {/* Top-Left Badge (if available) */}
      {t.badge && (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-1 rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-md backdrop-blur-sm">
          <Sparkles className="size-3 text-amber-300" />
          <span>{t.badge}</span>
        </div>
      )}

      {/* Browser Mockup / Image Preview */}
      <div className="relative overflow-hidden rounded-xl">
        <Mockup t={t} />
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
          <span className="truncate"><strong className="font-semibold text-ink/70">Pages:</strong> {t.pages}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={() => openApply(t)}
            className="flex-1 rounded-xl bg-helio px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-helio-dark hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            Apply Now
          </button>
          <a
            href={t.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-200 hover:bg-ink hover:text-white active:scale-[0.98]"
          >
            <span>Live Demo</span>
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
