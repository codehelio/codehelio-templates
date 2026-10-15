"use client";

import Image from "next/image";
import { useState } from "react";
import { categories, templates } from "@/lib/templates";
import TemplateCard from "@/components/TemplateCard";

const rings = [
  { cls: "", from: "-60%", delay: "0.1s" },
  { cls: "ring-blue", from: "0", delay: "0.75s" },
  { cls: "", from: "60%", delay: "0.35s" },
  { cls: "ring-e", from: "90%", delay: "0.5s" },
];

export default function Page() {
  const [active, setActive] = useState("All");
  const list = active === "All" ? templates : templates.filter((t) => t.category === active);

  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Image src="/CodeHelio_Logo.png" alt="CodeHelio" width={2576} height={1212} className="h-11 w-auto" priority />
        
        {/* Header Buttons */}
        <div className="flex items-center gap-3">
          <a href="/add-template" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/80 transition">
            Add template
          </a>
          <a href="#templates" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-mist transition">
            Browse templates
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl overflow-hidden px-5 pb-16 pt-8 sm:pt-14">
        <div className="flex" aria-hidden>
          {rings.map((r, i) => (
            <div key={i} className={`ring ${r.cls}`} style={{ "--from": r.from, "--delay": r.delay } as React.CSSProperties} />
          ))}
        </div>
        <div className="hero-copy mt-10 max-w-2xl">
          <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
            Choose a website template. We set it up for your business.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/75">
            Open a live demo, pick the one that fits, then press Apply. You get a client code so we can find your request straight away.
          </p>
        </div>
      </section>

      <main id="templates" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-20">
          <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Template category">
            {categories.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={active === c}
                onClick={() => setActive(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active === c ? "bg-ink text-white" : "bg-mist text-ink hover:bg-helio/15"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div key={active} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((t, i) => <TemplateCard key={t.slug} t={t} index={i} />)}
          </div>
        </div>
      </main>

      <footer className="bg-ink text-white/85">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
          <div><h2 className="font-semibold text-white">1. Pick</h2><p className="mt-2 text-sm">Check the live demo of any template and choose your favourite.</p></div>
          <div><h2 className="font-semibold text-white">2. Apply</h2><p className="mt-2 text-sm">Fill in your details. The form gives you a unique client code.</p></div>
          <div><h2 className="font-semibold text-white">3. Launch</h2><p className="mt-2 text-sm">We customise the template with your content and put it online.</p></div>
        </div>
        <p className="border-t border-white/15 py-4 text-center text-xs text-white/60">© CodeHelio</p>
      </footer>
    </>
  );
}