import type { Metadata } from "next";

import { LandingPage } from "@/components/landing";

export const metadata: Metadata = {
  title: "Inventory and Sales Management",
  description:
    "A complete inventory, POS, purchasing, customer, supplier, and reporting workspace for growing businesses.",
};

export default function PublicLandingPage() {
  return <LandingPage />;
}
