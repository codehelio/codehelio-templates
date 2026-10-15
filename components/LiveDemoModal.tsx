"use client";

import { useState, useEffect } from "react";
import type { Template } from "@/lib/templates";
import { useCurrency } from "@/lib/currency";
import {
  X,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface LiveDemoModalProps {
  isOpen: boolean;
  template: Template | null;
  onClose: () => void;
  onApply: (template: Template) => void;
}

export default function LiveDemoModal({
  isOpen,
  template,
  onClose,
  onApply,
}: LiveDemoModalProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
    }
  }, [isOpen, template]);

  // Handle ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !template) return null;

  const displayPrice = formatPrice(template.priceUsd, template.priceLkr);

  const getDeviceWidth = () => {
    switch (device) {
      case "mobile":
        return "max-w-[390px]";
      case "tablet":
        return "max-w-[768px]";
      default:
        return "w-full";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Navigation & Toolbar */}
      <div
        className="flex h-16 w-full items-center justify-between border-b border-white/10 bg-ink px-4 sm:px-6 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Template Info & Price */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{template.name}</span>
              <span className="rounded-full bg-helio/20 px-2 py-0.5 text-[11px] font-semibold text-sky-300 border border-helio/30">
                {template.category}
              </span>
            </div>
            <span className="text-xs text-white/60">
              Starting at <strong className="text-sky-400 font-bold">{displayPrice}</strong>
            </span>
          </div>
        </div>

        {/* Center: Device Switcher Toolbar */}
        <div className="hidden md:flex items-center gap-1 rounded-xl bg-white/10 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              device === "desktop"
                ? "bg-helio text-white shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            title="Desktop view"
          >
            <Monitor className="size-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              device === "tablet"
                ? "bg-helio text-white shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            title="Tablet view (768px)"
          >
            <Tablet className="size-3.5" />
            <span>Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              device === "mobile"
                ? "bg-helio text-white shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            title="Mobile view (390px)"
          >
            <Smartphone className="size-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setIframeKey((k) => k + 1);
            }}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
            title="Reload frame"
          >
            <RotateCw className="size-4" />
          </button>

          <a
            href={template.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
          >
            <span>Open in Tab</span>
            <ExternalLink className="size-3" />
          </a>

          <button
            type="button"
            onClick={() => {
              onClose();
              onApply(template);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-helio px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-helio-dark active:scale-95 transition"
          >
            <Sparkles className="size-3.5" />
            <span>Apply Now</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/60 hover:bg-white/15 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container with Iframe */}
      <div
        className="flex flex-1 items-center justify-center p-3 sm:p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative h-full transition-all duration-300 ease-in-out flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-white/20 ${getDeviceWidth()}`}
        >
          {/* Simulated Browser Bar */}
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-ink/10 bg-slate-100 px-4">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-center gap-1 rounded-md bg-white px-3 py-0.5 text-xs font-medium text-ink/60 border border-ink/10 max-w-sm truncate">
              <ShieldCheck className="size-3 text-emerald-500" />
              <span className="truncate">{template.demoUrl}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink/40">
              Interactive Preview
            </span>
          </div>

          {/* Iframe Frame */}
          <div className="relative flex-1 bg-white">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-ink/60 z-10">
                <div className="size-8 animate-spin rounded-full border-3 border-helio border-t-transparent" />
                <p className="mt-3 text-xs font-semibold">Connecting to live demo...</p>
              </div>
            )}
            <iframe
              key={iframeKey}
              src={template.demoUrl}
              title={template.name}
              className="h-full w-full border-0"
              onLoad={() => setLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
