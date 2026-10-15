export type Layout = "split" | "center" | "grid";

export type Template = {
  slug: string;
  name: string;
  category: string;
  blurb: string;
  pages: string;
  accent: string;
  layout: Layout;
  demoUrl: string;
};

// Replace demoUrl with each template's real live demo link.
export const templates: Template[] = [
  {
    slug: "saffron-table",
    name: "Saffron Table",
    category: "Restaurant",
    blurb: "Menu, table booking and a photo gallery that makes people hungry.",
    pages: "Home, Menu, Reservations, Gallery, Contact",
    accent: "#c2410c",
    layout: "split",
    demoUrl: "https://demo.codehelio.com/saffron-table",
  },
  {
    slug: "studio-lune",
    name: "Studio Lune",
    category: "Salon & spa",
    blurb: "Service list with prices, stylist profiles and online appointment requests.",
    pages: "Home, Services, Team, Book, Contact",
    accent: "#be5b86",
    layout: "center",
    demoUrl: "https://demo.codehelio.com/studio-lune",
  },
  {
    slug: "northside-clinic",
    name: "Northside Clinic",
    category: "Healthcare",
    blurb: "Doctors, opening hours and appointment booking, clear enough for any patient.",
    pages: "Home, Doctors, Services, Appointments, Contact",
    accent: "#0f766e",
    layout: "grid",
    demoUrl: "https://demo.codehelio.com/northside-clinic",
  },
  {
    slug: "folio",
    name: "Folio",
    category: "Portfolio",
    blurb: "A quiet, fast portfolio for designers, photographers and developers.",
    pages: "Home, Work, Case study, About, Contact",
    accent: "#027cc7",
    layout: "split",
    demoUrl: "https://demo.codehelio.com/folio",
  },
  {
    slug: "keystone-homes",
    name: "Keystone Homes",
    category: "Real estate",
    blurb: "Property listings with filters, photo galleries and enquiry forms.",
    pages: "Home, Listings, Property, Agents, Contact",
    accent: "#1d4ed8",
    layout: "grid",
    demoUrl: "https://demo.codehelio.com/keystone-homes",
  },
  {
    slug: "cartwell",
    name: "Cartwell",
    category: "Online store",
    blurb: "Product pages, cart and checkout flow for a small shop.",
    pages: "Home, Shop, Product, Cart, Checkout",
    accent: "#7c3aed",
    layout: "center",
    demoUrl: "https://demo.codehelio.com/cartwell",
  },
];

export const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];
