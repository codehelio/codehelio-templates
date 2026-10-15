"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  initialTemplates,
  categories,
  type Template,
} from "@/lib/templates";
import TemplateCard from "@/components/TemplateCard";
import AddTemplateModal from "@/components/AddTemplateModal";
import {
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  CheckCircle2,
  LogOut,
  User,
  SlidersHorizontal,
  X,
  Hotel,
  Building2,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
  Scissors,
  Home,
  Briefcase,
  Layers,
} from "lucide-react";
import Swal from "sweetalert2";

const rings = [
  { cls: "", from: "-60%", delay: "0.1s" },
  { cls: "ring-blue", from: "0", delay: "0.75s" },
  { cls: "", from: "60%", delay: "0.35s" },
  { cls: "ring-e", from: "90%", delay: "0.5s" },
];

export default function Page() {
  const [templateList, setTemplateList] = useState<Template[]>(initialTemplates);
  const [active, setActive] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState<{ name: string; email: string; role?: string } | null>(null);

  // Load custom templates and user session from localStorage
  useEffect(() => {
    try {
      const savedTemplates = localStorage.getItem("codehelio_custom_templates");
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTemplateList([...parsed, ...initialTemplates]);
        }
      }

      const savedUser = localStorage.getItem("codehelio_auth_user");
      if (savedUser) {
        setAuthUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("codehelio_auth_user");
    setAuthUser(null);
    Swal.fire({
      icon: "info",
      title: "Signed Out",
      text: "You have been logged out successfully.",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  const handleAddTemplate = (newTemplate: Template) => {
    const updated = [newTemplate, ...templateList];
    setTemplateList(updated);

    try {
      const customTemplates = updated.filter(
        (t) => !initialTemplates.some((init) => init.slug === t.slug)
      );
      localStorage.setItem("codehelio_custom_templates", JSON.stringify(customTemplates));
    } catch {
      // storage error fallback
    }

    // Set filter to new template category to show it immediately
    setActive(newTemplate.category);

    Swal.fire({
      icon: "success",
      title: "Template Published!",
      html: `<b>${newTemplate.name}</b> (${newTemplate.category}) has been added with price <b>${newTemplate.price}</b>.`,
      confirmButtonColor: "#027cc7",
    });
  };

  // Filter templates based on active category and search query
  const filteredTemplates = useMemo(() => {
    return templateList.filter((t) => {
      const matchesCategory = active === "All" || t.category.toLowerCase() === active.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        t.name.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.blurb.toLowerCase().includes(query) ||
        t.price.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [templateList, active, searchQuery]);

  // Category Icon helper
  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "hotel":
        return <Hotel className="size-3.5" />;
      case "hospital":
        return <Building2 className="size-3.5" />;
      case "ecommerce":
        return <ShoppingBag className="size-3.5" />;
      case "supermarket":
        return <ShoppingCart className="size-3.5" />;
      case "restaurant":
        return <UtensilsCrossed className="size-3.5" />;
      case "salon & spa":
        return <Scissors className="size-3.5" />;
      case "real estate":
        return <Home className="size-3.5" />;
      case "portfolio":
        return <Briefcase className="size-3.5" />;
      default:
        return <Layers className="size-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-ink antialiased selection:bg-helio/20">
      {/* ---------- Sticky Modern Header ---------- */}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/85 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Logo & Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/CodeHelio_Logo.png"
                alt="CodeHelio"
                width={2576}
                height={1212}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <span className="hidden sm:inline-flex items-center rounded-full bg-helio/10 px-2.5 py-0.5 text-xs font-semibold text-helio border border-helio/15">
              Marketplace
            </span>
          </div>

          {/* Header Action Cluster */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Browse Link */}
            <a
              href="#templates"
              className="hidden md:inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-ink/75 hover:bg-mist hover:text-ink transition"
            >
              Browse Catalog
            </a>

            {/* Add Template Button (Opens Popup Modal as requested) */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/85 active:scale-95 cursor-pointer"
              id="header-add-template-btn"
            >
              <Plus className="size-4 text-helio" />
              <span>Add Template</span>
            </button>

            {/* User Auth Status / Login Link */}
            {authUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-ink/15">
                <div className="flex items-center gap-2 rounded-xl bg-mist px-3 py-1.5 border border-ink/10">
                  <div className="size-6 rounded-full bg-helio text-white flex items-center justify-center text-xs font-bold">
                    {authUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold max-w-[100px] truncate hidden sm:inline">
                    {authUser.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  className="rounded-lg p-2 text-ink/50 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-helio/10 px-4 py-2 text-sm font-semibold text-helio hover:bg-helio hover:text-white transition active:scale-95 border border-helio/20"
                id="header-login-btn"
              >
                <User className="size-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ---------- Redesigned Hero Section UI/UX ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-sky-50/40 to-slate-50 border-b border-ink/10 pt-10 pb-16 sm:pt-16 sm:pb-24">
        {/* Soft Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 right-1/4 size-96 rounded-full bg-helio/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-10 size-80 rounded-full bg-sky-200/40 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-7">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-helio/25 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-helio shadow-xs backdrop-blur-sm">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Over 50+ Ready-to-Launch Business Website Templates</span>
              </div>

              {/* Main Headline */}
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.12]">
                Choose a website template.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-helio via-sky-600 to-blue-700">
                  We launch it for your business.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/75 sm:text-xl">
                Explore interactive live demos across{" "}
                <strong className="font-semibold text-ink">Hotel, Hospital, Ecommerce, Supermarket</strong>{" "}
                and more. Pick your favorite, customize the copy, and go live with your own domain in 48 hours.
              </p>

              {/* Hero Action Cluster */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <a
                  href="#templates"
                  className="inline-flex items-center gap-2 rounded-xl bg-helio px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-helio/25 transition-all hover:bg-helio-dark hover:shadow-helio/35 active:scale-95"
                >
                  <span>Explore Templates</span>
                  <ArrowRight className="size-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-ink/20 bg-white px-5 py-3.5 text-base font-bold text-ink shadow-sm transition hover:bg-slate-50 hover:border-ink/40 active:scale-95 cursor-pointer"
                >
                  <Plus className="size-4 text-helio" />
                  <span>Submit Template</span>
                </button>
              </div>

              {/* Live Search Quick Box inside Hero */}
              <div className="mt-8 max-w-xl">
                <div className="relative flex items-center rounded-2xl border border-ink/15 bg-white p-2 shadow-sm focus-within:border-helio focus-within:ring-3 focus-within:ring-helio/15 transition-all">
                  <Search className="size-5 text-ink/40 ml-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Hotel, Hospital, Ecommerce, Supermarket, price..."
                    className="w-full bg-transparent px-3 py-1.5 text-sm font-medium text-ink focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="rounded-full p-1 text-ink/40 hover:bg-mist hover:text-ink cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                  <a
                    href="#templates"
                    className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-ink/80 transition whitespace-nowrap"
                  >
                    Find ({filteredTemplates.length})
                  </a>
                </div>
              </div>

              {/* Value Proposition Pills */}
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 pt-6 border-t border-ink/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-helio/10 text-helio">
                    <Zap className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-ink/80">48h Setup Guarantee</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Globe2 className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-ink/80">Domain & Cloud Hosting</span>
                </div>
                <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <ShieldCheck className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-ink/80">Verified & Responsive</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase with Brand Rings & Interactive Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual CodeHelio Rings Animation */}
                <div className="flex justify-center mb-6" aria-hidden>
                  {rings.map((r, i) => (
                    <div
                      key={i}
                      className={`ring ${r.cls}`}
                      style={{ "--from": r.from, "--delay": r.delay } as React.CSSProperties}
                    />
                  ))}
                </div>

                {/* Floating Preview Card with Top-Right Price Tag */}
                <div className="relative rounded-3xl border border-ink/15 bg-white/95 p-4 shadow-2xl backdrop-blur-md">
                  {/* Floating Price Tag at Top-Right (Prominent showcase) */}
                  <div className="absolute top-7 right-7 z-20 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-sm font-bold text-helio shadow-xl border border-helio/30">
                    <span className="text-xs font-semibold text-ink/50">Starts at</span>
                    <span className="text-base font-extrabold text-helio">$89</span>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-ink/10 bg-slate-50">
                    <div className="flex items-center justify-between border-b border-ink/10 bg-mist px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-rose-400" />
                        <span className="size-2.5 rounded-full bg-amber-400" />
                        <span className="size-2.5 rounded-full bg-emerald-400" />
                        <span className="ml-2 rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-ink/60 border border-ink/10">
                          codehelio-demo.com
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Demo</span>
                    </div>

                    <div className="p-4 space-y-3 bg-gradient-to-br from-slate-50 to-sky-50/30">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-helio/15 px-2.5 py-0.5 text-xs font-bold text-helio">
                          Hotel & Luxury Resort
                        </span>
                        <span className="text-xs text-ink/50">5 Included Pages</span>
                      </div>
                      <div className="h-28 rounded-xl bg-gradient-to-r from-helio/80 to-sky-600 flex flex-col justify-end p-3 text-white shadow-inner">
                        <span className="text-xs font-medium text-white/80">Grand Azure Resort</span>
                        <h4 className="text-base font-bold">Five-Star Hospitality & Suites</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-10 rounded-lg bg-white border border-ink/10 flex items-center justify-center text-[10px] font-semibold text-ink/70">
                          Suite Booking
                        </div>
                        <div className="h-10 rounded-lg bg-white border border-ink/10 flex items-center justify-center text-[10px] font-semibold text-ink/70">
                          Dining Menu
                        </div>
                        <div className="h-10 rounded-lg bg-white border border-ink/10 flex items-center justify-center text-[10px] font-semibold text-ink/70">
                          Spa Services
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust Footer of Card */}
                  <div className="mt-3 flex items-center justify-between px-2 text-xs text-ink/65">
                    <span className="flex items-center gap-1 font-medium">
                      <Sparkles className="size-3.5 text-amber-500" />
                      Client Code Generated Automatically
                    </span>
                    <span className="font-bold text-helio">100% Turnkey</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Main Template Catalog Section ---------- */}
      <main id="templates" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-helio">
              <SlidersHorizontal className="size-3.5" />
              <span>Browse Catalog</span>
            </div>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Curated Business Templates
            </h2>
            <p className="mt-1 text-sm text-ink/70 max-w-xl">
              Every card shows the starting price in the top-right corner. Click "Live Demo" to explore or "Apply" to get your code.
            </p>
          </div>

          {/* Quick Add Button & Active Counter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-ink/60 bg-white px-3 py-1.5 rounded-xl border border-ink/10">
              Showing <strong className="text-ink">{filteredTemplates.length}</strong> templates
            </span>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-helio px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-helio-dark transition cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Categories Bar & Search Filter */}
        <div className="space-y-4 mb-8">
          {/* Category Tabs */}
          <div
            className="flex flex-wrap items-center gap-2 pb-2"
            role="tablist"
            aria-label="Template category"
          >
            {categories.map((c) => {
              const count =
                c === "All"
                  ? templateList.length
                  : templateList.filter((t) => t.category.toLowerCase() === c.toLowerCase()).length;

              const isSelected = active.toLowerCase() === c.toLowerCase();

              return (
                <button
                  key={c}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActive(c)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs ${
                    isSelected
                      ? "bg-ink text-white shadow-md scale-105"
                      : "bg-white text-ink/80 border border-ink/15 hover:bg-helio/10 hover:text-helio hover:border-helio/30"
                  }`}
                >
                  {getCategoryIcon(c)}
                  <span>{c}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-mist text-ink/60"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Indicator Filter */}
          {searchQuery && (
            <div className="flex items-center justify-between rounded-xl bg-helio/5 border border-helio/20 px-4 py-2 text-xs">
              <div className="flex items-center gap-2 text-ink">
                <Search className="size-3.5 text-helio" />
                <span>
                  Filtering for keyword: <strong>"{searchQuery}"</strong> ({filteredTemplates.length} matches)
                </span>
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="font-bold text-helio hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Template Grid or Empty State */}
        {filteredTemplates.length > 0 ? (
          <div key={`${active}-${searchQuery}`} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((t, i) => (
              <TemplateCard key={t.slug} t={t} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-ink/20 bg-white p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-mist text-ink/40">
              <Search className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-ink">No templates found</h3>
            <p className="mt-1 text-sm text-ink/60 max-w-sm mx-auto">
              We couldn't find any templates matching "{searchQuery}" in category "{active}".
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActive("All");
                }}
                className="rounded-xl border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:bg-mist transition cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="rounded-xl bg-helio px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-helio-dark transition cursor-pointer"
              >
                Add Template to {active}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ---------- 3-Step Process Guide Section ---------- */}
      <section className="border-t border-ink/10 bg-mist/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-helio">
              Streamlined Onboarding
            </span>
            <h2 className="mt-1 text-3xl font-extrabold text-ink">How CodeHelio Works</h2>
            <p className="mt-2 text-sm text-ink/70">
              Getting your professional website online is painless, transparent, and swift.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex size-10 items-center justify-center rounded-xl bg-helio/10 text-helio font-bold text-lg">
                1
              </div>
              <h3 className="mt-4 text-xl font-bold text-ink">Pick Your Template</h3>
              <p className="mt-2 text-sm text-ink/70 leading-relaxed">
                Click "Live Demo" on any card to explore the design, pages, and mobile responsiveness. Notice the starting price clearly displayed on the top right.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 font-bold text-lg">
                2
              </div>
              <h3 className="mt-4 text-xl font-bold text-ink">Apply in 60 Seconds</h3>
              <p className="mt-2 text-sm text-ink/70 leading-relaxed">
                Hit "Apply" to open the request form. Input your business name, domain preference, and receive an instant unique client tracking code.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                3
              </div>
              <h3 className="mt-4 text-xl font-bold text-ink">Go Live in 48 Hours</h3>
              <p className="mt-2 text-sm text-ink/70 leading-relaxed">
                Our engineering team injects your brand content, activates SSL, configures your domain, and deploys your website to global edge hosting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Modern Footer ---------- */}
      <footer className="border-t border-ink/10 bg-ink text-white/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Image
                src="/CodeHelio_Logo.png"
                alt="CodeHelio"
                width={2576}
                height={1212}
                className="h-9 w-auto brightness-200"
              />
              <span className="text-xs text-white/50 border-l border-white/20 pl-3">
                Templates & Web Launch Platform
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm font-medium">
              <a href="#templates" className="hover:text-white transition">
                Templates
              </a>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="hover:text-white transition cursor-pointer"
              >
                Add Template
              </button>
              <Link href="/login" className="hover:text-white transition">
                Login
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
            <p>© {new Date().getFullYear()} CodeHelio. All rights reserved.</p>
            <p>Designed for fast deployment & high-conversion business websites.</p>
          </div>
        </div>
      </footer>

      {/* ---------- Add Template Popup Modal (As requested by user) ---------- */}
      <AddTemplateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTemplate={handleAddTemplate}
      />
    </div>
  );
}