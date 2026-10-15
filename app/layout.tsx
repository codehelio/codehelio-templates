import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/lib/currency";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "CodeHelio website templates",
  description: "Pick a ready-made website template, see the live demo and apply with your details.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}