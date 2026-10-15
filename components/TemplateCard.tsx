"use client";

import type { Template } from "@/lib/templates";
import { openApply } from "@/lib/apply";
import Mockup from "./Mockup";

export default function TemplateCard({ t, index }: { t: Template; index: number }) {
  return (
    <article
      className="group card-in flex flex-col rounded-2xl bg-mist p-3 transition-shadow hover:shadow-[0_18px_40px_-18px_rgba(2,124,199,0.45)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Mockup t={t} />

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold">{t.name}</h3>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-xs text-ink/70">{t.category}</span>
        </div>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/80">{t.blurb}</p>
        <p className="mt-2 text-sm text-ink/55">Pages: {t.pages}</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => openApply(t)}
            className="flex-1 rounded-xl bg-helio px-4 py-2.5 font-semibold text-white transition hover:bg-helio-dark active:scale-[0.98]"
          >
            Apply
          </button>
          <a
            href={t.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl border-2 border-ink/80 px-4 py-2.5 text-center font-semibold transition hover:bg-ink hover:text-white active:scale-[0.98]"
          >
            Live demo
          </a>
        </div>
      </div>
    </article>
  );
}
