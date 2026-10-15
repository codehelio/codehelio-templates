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
  price: string;
  priceUsd: number;
  priceLkr: number;
  imageUrl?: string;
  badge?: string;
};

export const TEMPLATE_CATEGORIES = [
  "Hotel",
  "Hospital",
  "Ecommerce",
  "Supermarket",
  "Restaurant",
  "Salon & spa",
  "Real estate",
  "Portfolio",
] as const;

export const initialTemplates: Template[] = [
  {
    slug: "grand-azure-resort",
    name: "Grand Azure Luxury Resort",
    category: "Hotel",
    blurb: "Room suites booking, virtual tour, amenities showcase, and instant reservation inquiry.",
    pages: "Home, Rooms & Suites, Dining, Spa, Booking, Contact",
    accent: "#027cc7",
    layout: "split",
    demoUrl: "https://demo.codehelio.com/grand-azure",
    price: "$99",
    priceUsd: 99,
    priceLkr: 32670,
    badge: "Popular",
  },
  {
    slug: "carepoint-hospital",
    name: "CarePoint Super Speciality",
    category: "Hospital",
    blurb: "Doctor profiles, OPD schedule, online appointments, emergency hotline, and patient portal.",
    pages: "Home, Doctors, Departments, Appointments, Emergency, Contact",
    accent: "#0f766e",
    layout: "grid",
    demoUrl: "https://demo.codehelio.com/carepoint",
    price: "$89",
    priceUsd: 89,
    priceLkr: 29370,
    badge: "Healthcare",
  },
  {
    slug: "cartwell-store",
    name: "Cartwell Fashion & Goods",
    category: "Ecommerce",
    blurb: "Modern product catalog, instant cart drawer, secure checkout flow, and discount coupons.",
    pages: "Home, Shop, Collections, Product Details, Cart, Checkout",
    accent: "#7c3aed",
    layout: "center",
    demoUrl: "https://demo.codehelio.com/cartwell",
    price: "$119",
    priceUsd: 119,
    priceLkr: 39270,
    badge: "Best Seller",
  },
  {
    slug: "freshmart-market",
    name: "FreshMart Express",
    category: "Supermarket",
    blurb: "Daily grocery discounts, category aisles, fresh produce orders, and same-day delivery slots.",
    pages: "Home, Aisles, Fresh Produce, Weekly Deals, Quick Order, Contact",
    accent: "#16a34a",
    layout: "grid",
    demoUrl: "https://demo.codehelio.com/freshmart",
    price: "$109",
    priceUsd: 109,
    priceLkr: 35970,
    badge: "Fresh Deals",
  },
  {
    slug: "saffron-table",
    name: "Saffron Table Fine Dine",
    category: "Restaurant",
    blurb: "Online table reservations, curated multi-course menu, and appetizing culinary gallery.",
    pages: "Home, Menu, Reservations, Private Events, Gallery, Contact",
    accent: "#c2410c",
    layout: "split",
    demoUrl: "https://demo.codehelio.com/saffron-table",
    price: "$79",
    priceUsd: 79,
    priceLkr: 26070,
  },
  {
    slug: "studio-lune",
    name: "Studio Lune Wellness Spa",
    category: "Salon & spa",
    blurb: "Service menu with transparent pricing, stylist portfolios, and easy calendar bookings.",
    pages: "Home, Services, Team, Online Booking, Pricing, Contact",
    accent: "#be5b86",
    layout: "center",
    demoUrl: "https://demo.codehelio.com/studio-lune",
    price: "$69",
    priceUsd: 69,
    priceLkr: 22770,
  },
  {
    slug: "keystone-homes",
    name: "Keystone Luxury Realty",
    category: "Real estate",
    blurb: "Property search filters, high-resolution photo galleries, agent direct contact, and map pins.",
    pages: "Home, Featured Listings, Properties, Virtual Tours, Contact",
    accent: "#1d4ed8",
    layout: "grid",
    demoUrl: "https://demo.codehelio.com/keystone-homes",
    price: "$129",
    priceUsd: 129,
    priceLkr: 42570,
  },
  {
    slug: "folio-creative",
    name: "Folio Creator Studio",
    category: "Portfolio",
    blurb: "Minimalist, blazing-fast personal brand portfolio for agencies, designers, and engineers.",
    pages: "Home, Case Studies, Projects, About, Resume, Contact",
    accent: "#0ea5e9",
    layout: "split",
    demoUrl: "https://demo.codehelio.com/folio",
    price: "$49",
    priceUsd: 49,
    priceLkr: 16170,
  },
];

export const templates = initialTemplates;

export const categories = [
  "All",
  "Hotel",
  "Hospital",
  "Ecommerce",
  "Supermarket",
  "Restaurant",
  "Salon & spa",
  "Real estate",
  "Portfolio",
];
