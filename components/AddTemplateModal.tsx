"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sparkles,
  DollarSign,
  Globe,
  Tag,
  Layers,
  FileText,
} from "lucide-react";
import type { Template } from "@/lib/templates";
import { supabase } from "@/lib/supabase";

interface AddTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTemplate: (newTemplate: Template) => void;
}

const CATEGORY_OPTIONS = [
  { value: "Hotel", label: "Hotel & Resort", color: "#027cc7" },
  { value: "Hospital", label: "Hospital & Healthcare", color: "#0f766e" },
  { value: "Ecommerce", label: "Ecommerce & Store", color: "#7c3aed" },
  { value: "Supermarket", label: "Supermarket & Grocery", color: "#16a34a" },
  { value: "Restaurant", label: "Restaurant & Cafe", color: "#c2410c" },
  { value: "Salon & spa", label: "Salon & Spa", color: "#be5b86" },
  { value: "Real estate", label: "Real Estate & Property", color: "#1d4ed8" },
  { value: "Portfolio", label: "Portfolio & Agency", color: "#0ea5e9" },
  { value: "Garment", label: "Garment & factory", color: "#d97706" },
];

export default function AddTemplateModal({
  isOpen,
  onClose,
  onAddTemplate,
}: AddTemplateModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("$89");
  const [demoUrl, setDemoUrl] = useState("");
  const [category, setCategory] = useState("Hotel");
  const [description, setDescription] = useState("");
  const [pages, setPages] = useState("Home, About, Services, Gallery, Contact");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    setError(null);
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter the Template Name.");
      return;
    }
    if (!price.trim()) {
      setError("Please enter a price (e.g. $89).");
      return;
    }
    if (!demoUrl.trim()) {
      setError("Please provide a demo or preview URL.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a brief description.");
      return;
    }

    setLoading(true);
    setError(null);

    // Format price if user omitted currency symbol
    let formattedPrice = price.trim();
    if (!formattedPrice.startsWith("$") && !formattedPrice.toLowerCase().startsWith("rs")) {
      formattedPrice = `$${formattedPrice}`;
    }

    // Determine category accent color
    const matchedCategory = CATEGORY_OPTIONS.find((c) => c.value === category);
    const accent = matchedCategory?.color || "#027cc7";

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const num = parseFloat(price.replace(/[^0-9.]/g, "")) || 89;
    const isLkr = price.toLowerCase().includes("rs") || price.toLowerCase().includes("lkr");
    const priceUsd = isLkr ? Math.round(num / 330) : num;
    const priceLkr = isLkr ? num : Math.round(num * 330);

    const newTemplate: Template = {
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      category,
      price: formattedPrice,
      priceUsd,
      priceLkr,
      demoUrl: demoUrl.startsWith("http") ? demoUrl : `https://${demoUrl}`,
      blurb: description.trim(),
      pages: pages.trim() || "Home, About, Services, Contact",
      accent,
      layout: category === "Hotel" ? "split" : category === "Hospital" ? "grid" : "center",
      imageUrl: imagePreview || undefined,
      badge: "New",
    };

    try {
      const { error: dbError } = await supabase.from("templates").insert([
        {
          slug: newTemplate.slug,
          name: newTemplate.name,
          category: newTemplate.category,
          price: newTemplate.price,
          price_usd: newTemplate.priceUsd,
          price_lkr: newTemplate.priceLkr,
          demo_url: newTemplate.demoUrl,
          blurb: newTemplate.blurb,
          pages: newTemplate.pages,
          accent: newTemplate.accent,
          layout: newTemplate.layout,
          image_url: newTemplate.imageUrl,
          badge: newTemplate.badge,
        },
      ]);

      if (dbError) {
        throw dbError;
      }

      onAddTemplate(newTemplate);
      onClose();
    } catch (err: any) {
      // නියම Supabase error විස්තරය console එකට ලබා ගැනීම
      console.error("Supabase Error Details:", {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        raw: err
      });

      const errorMsg = err?.message || err?.details || "Failed to save template to database. Please check console.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-ink/10 transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-ink/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-helio/10 px-3 py-1 text-xs font-semibold text-helio">
              <Sparkles className="size-3.5" />
              <span>Add New Template</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-ink">Publish Your Template</h2>
            <p className="text-sm text-ink/70">
              Provide template details, price, category, and screenshots to showcase to clients.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-ink/50 hover:bg-mist hover:text-ink transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
            <AlertCircle className="size-4 shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Grid Row 1: Name and Price */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80 mb-1.5">
                Template Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Azure Luxury Resort"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-ink/20 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-3 focus:ring-helio/15"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80 mb-1.5">
                Price <span className="text-rose-500">*</span> (Displayed top-right)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
                  <DollarSign className="size-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="$89 or Rs. 25,000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-ink/20 bg-slate-50 pl-9 pr-3.5 py-2.5 text-sm font-medium text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-3 focus:ring-helio/15"
                />
              </div>
            </div>
          </div>

          {/* Grid Row 2: Category and Demo URL */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80 mb-1.5">
                Template Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
                  <Tag className="size-4" />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-ink/20 bg-slate-50 pl-9 pr-3.5 py-2.5 text-sm font-medium text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-3 focus:ring-helio/15 cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80 mb-1.5">
                Live Demo URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
                  <Globe className="size-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="https://demo.example.com"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full rounded-xl border border-ink/20 bg-slate-50 pl-9 pr-3.5 py-2.5 text-sm font-medium text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-3 focus:ring-helio/15"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <textarea
                required
                rows={3}
                placeholder="Briefly describe what is special about this template..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-ink/20 bg-slate-50 px-3.5 py-2.5 text-sm text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-3 focus:ring-helio/15"
              />
            </div>
          </div>

          {/* Pages Included */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80 mb-1.5">
              Included Pages
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
                <Layers className="size-4" />
              </div>
              <input
                type="text"
                placeholder="Home, About, Services, Gallery, Contact"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="w-full rounded-xl border border-ink/20 bg-slate-50 pl-9 pr-3.5 py-2.5 text-sm font-medium text-ink focus:border-helio focus:bg-white focus:outline-none focus:ring-3 focus:ring-helio/15"
              />
            </div>
          </div>

          {/* Image Upload Zone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80 mb-1.5">
              Template Preview Image (Upload)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            {!imagePreview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
                  dragActive
                    ? "border-helio bg-helio/5"
                    : "border-ink/20 bg-slate-50 hover:bg-mist hover:border-helio/40"
                }`}
              >
                <div className="rounded-full bg-helio/10 p-3 text-helio mb-2">
                  <Upload className="size-6" />
                </div>
                <p className="text-sm font-semibold text-ink">
                  Click to upload or drag & drop template screenshot
                </p>
                <p className="mt-1 text-xs text-ink/50">
                  Supports PNG, JPG, or WebP (max 5MB)
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-ink/15 overflow-hidden bg-slate-50 p-2">
                <div className="relative h-44 w-full rounded-xl overflow-hidden bg-white">
                  <img
                    src={imagePreview}
                    alt="Template preview"
                    className="h-full w-full object-cover object-top"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink shadow-md hover:bg-white transition"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFileName("");
                      }}
                      className="rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md hover:bg-rose-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 px-2 text-xs text-emerald-600 font-medium">
                  <Check className="size-3.5" />
                  <span className="truncate">{imageFileName || "Screenshot uploaded"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink/80 hover:bg-mist transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-helio px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-helio-dark active:scale-[0.98] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="size-4" />
              <span>{loading ? "Publishing..." : "Publish Template"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}