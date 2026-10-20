"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Swal from "sweetalert2";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  X,
  Upload,
  Tag,
  DollarSign,
  Layers,
  Globe,
  FileText,
  Sparkles,
  Check,
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Template {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: string;
  price_usd: number;
  price_lkr: number;
  demo_url: string;
  blurb: string;
  pages: string;
  accent: string;
  layout: string;
  image_url?: string;
  badge: string;
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

export default function TemplatesAdminPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("$89");
  const [demoUrl, setDemoUrl] = useState("");
  const [category, setCategory] = useState("Hotel");
  const [description, setDescription] = useState("");
  const [pages, setPages] = useState("Home, About, Services, Gallery, Contact");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch Templates from Supabase
  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("templates").select("*").order("id", { ascending: false });
    if (error) {
      Swal.fire("Error!", error.message, "error");
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

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

  const resetForm = () => {
    setName("");
    setPrice("$89");
    setDemoUrl("");
    setCategory("Hotel");
    setDescription("");
    setPages("Home, About, Services, Gallery, Contact");
    setImagePreview(null);
    setImageFileName("");
    setError(null);
  };

  // CREATE SUBMIT
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim() || !demoUrl.trim() || !description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    let formattedPrice = price.trim();
    if (!formattedPrice.startsWith("$") && !formattedPrice.toLowerCase().startsWith("rs")) {
      formattedPrice = `$${formattedPrice}`;
    }

    const matchedCategory = CATEGORY_OPTIONS.find((c) => c.value === category);
    const accent = matchedCategory?.color || "#027cc7";

    const slugBase = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${slugBase}-${Math.floor(100 + Math.random() * 900)}`;

    const num = parseFloat(price.replace(/[^0-9.]/g, "")) || 89;
    const isLkr = price.toLowerCase().includes("rs") || price.toLowerCase().includes("lkr");
    const priceUsd = isLkr ? Math.round(num / 330) : num;
    const priceLkr = isLkr ? num : Math.round(num * 330);
    const layout = category === "Hotel" ? "split" : category === "Hospital" ? "grid" : "center";

    const newRow = {
      slug,
      name: name.trim(),
      category,
      price: formattedPrice,
      price_usd: priceUsd,
      price_lkr: priceLkr,
      demo_url: demoUrl.startsWith("http") ? demoUrl : `https://${demoUrl}`,
      blurb: description.trim(),
      pages: pages.trim() || "Home, About, Services, Contact",
      accent,
      layout,
      image_url: imagePreview || null,
      badge: "New",
    };

    const { error: dbError } = await supabase.from("templates").insert([newRow]);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
    } else {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Template published successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsCreateOpen(false);
      resetForm();
      fetchTemplates();
      setLoading(false);
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (t: Template) => {
    setCurrentTemplate(t);
    setName(t.name || "");
    setPrice(t.price || "$89");
    setDemoUrl(t.demo_url || "");
    setCategory(t.category || "Hotel");
    setDescription(t.blurb || "");
    setPages(t.pages || "");
    setImagePreview(t.image_url || null);
    setIsEditOpen(true);
  };

  // EDIT SUBMIT
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) return;

    setLoading(true);
    setError(null);

    let formattedPrice = price.trim();
    if (!formattedPrice.startsWith("$") && !formattedPrice.toLowerCase().startsWith("rs")) {
      formattedPrice = `$${formattedPrice}`;
    }

    const matchedCategory = CATEGORY_OPTIONS.find((c) => c.value === category);
    const accent = matchedCategory?.color || "#027cc7";

    const num = parseFloat(price.replace(/[^0-9.]/g, "")) || 89;
    const isLkr = price.toLowerCase().includes("rs") || price.toLowerCase().includes("lkr");
    const priceUsd = isLkr ? Math.round(num / 330) : num;
    const priceLkr = isLkr ? num : Math.round(num * 330);
    const layout = category === "Hotel" ? "split" : category === "Hospital" ? "grid" : "center";

    const updatedRow = {
      name: name.trim(),
      category,
      price: formattedPrice,
      price_usd: priceUsd,
      price_lkr: priceLkr,
      demo_url: demoUrl.startsWith("http") ? demoUrl : `https://${demoUrl}`,
      blurb: description.trim(),
      pages: pages.trim() || "Home, About, Services, Contact",
      accent,
      layout,
      image_url: imagePreview || currentTemplate.image_url || null,
    };

    const { error: dbError } = await supabase
      .from("templates")
      .update(updatedRow)
      .eq("id", currentTemplate.id);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
    } else {
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Template updated successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsEditOpen(false);
      setCurrentTemplate(null);
      resetForm();
      fetchTemplates();
      setLoading(false);
    }
  };

  // DELETE TEMPLATE
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) {
        Swal.fire("Error!", error.message, "error");
      } else {
        Swal.fire("Deleted!", "Template has been deleted.", "success");
        fetchTemplates();
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Templates Management</h1>
          <p className="text-sm text-slate-500">Manage, add, edit, and delete your website templates.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New Template
        </button>
      </div>

      {/* Templates Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No templates found. Click "Add New Template".</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Template Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">USD / LKR</th>
                  <th className="px-6 py-4 font-semibold">Live Demo</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templates.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <img
                        src={t.image_url || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=100"}
                        alt=""
                        className="h-10 w-14 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{t.blurb}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{t.price}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      ${t.price_usd} / Rs. {t.price_lkr}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={t.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                      >
                        Demo <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(t)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  <Sparkles className="size-3.5" />
                  <span>Add New Template</span>
                </div>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Publish Your Template</h2>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Grand Azure Resort"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Price *</label>
                  <input
                    type="text"
                    required
                    placeholder="$89 or Rs. 25,000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Live Demo URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://demo.com"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Template description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Included Pages</label>
                <input
                  type="text"
                  placeholder="Home, About, Services, Contact"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Template Preview Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center cursor-pointer hover:bg-slate-100 transition"
                  >
                    <Upload className="size-6 text-indigo-500 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Click to upload screenshot</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50">
                    <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-4 right-4 rounded-lg bg-rose-500 px-2 py-1 text-xs text-white"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Publishing..." : "Publish Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Edit Template</h2>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Price *</label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Live Demo URL *</label>
                  <input
                    type="url"
                    required
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Included Pages</label>
                <input
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Image Upload / Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Template Preview Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 cursor-pointer text-center"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                  ) : (
                    <div className="py-6 text-xs text-slate-500">Click to change preview image</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}