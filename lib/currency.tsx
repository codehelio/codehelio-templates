"use client";

import { useState, useEffect, createContext, useContext } from "react";

export type Currency = "USD" | "LKR";

const USD_TO_LKR_RATE = 330;

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  formatPrice: (usdPrice: number | string, customLkrPrice?: number | string) => string;
  convertUsdToLkr: (usd: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "LKR",
  toggleCurrency: () => {},
  formatPrice: () => "",
  convertUsdToLkr: (usd) => usd * USD_TO_LKR_RATE,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("LKR");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("codehelio_currency");
      if (saved === "USD" || saved === "LKR") {
        setCurrency(saved);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleCurrency = () => {
    const next = currency === "USD" ? "LKR" : "USD";
    setCurrency(next);
    try {
      localStorage.setItem("codehelio_currency", next);
    } catch {
      // ignore
    }
  };

  const convertUsdToLkr = (usd: number) => Math.round(usd * USD_TO_LKR_RATE);

  const formatPrice = (usdPrice: number | string, customLkrPrice?: number | string): string => {
    // Parse numeric USD price
    const numUsd = typeof usdPrice === "number" 
      ? usdPrice 
      : parseFloat(String(usdPrice).replace(/[^0-9.]/g, "")) || 0;

    if (currency === "USD") {
      return `$${numUsd.toFixed(0)}`;
    } else {
      if (customLkrPrice !== undefined) {
        const numLkr = typeof customLkrPrice === "number"
          ? customLkrPrice
          : parseFloat(String(customLkrPrice).replace(/[^0-9.]/g, "")) || 0;
        return `Rs. ${numLkr.toLocaleString()}`;
      }
      const calculatedLkr = Math.round(numUsd * USD_TO_LKR_RATE);
      return `Rs. ${calculatedLkr.toLocaleString()}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, formatPrice, convertUsdToLkr }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
