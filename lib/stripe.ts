import "server-only";
import Stripe from "stripe";

export const getStripe = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is missing from environment variables.");
  }

  return new Stripe(apiKey, {
    // optional: apiVersion: "2025-02-24.acacia",
  });
};