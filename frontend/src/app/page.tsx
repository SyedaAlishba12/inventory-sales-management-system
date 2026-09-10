import type { Metadata } from "next";

import { LandingPage } from "@/components/landing";

export const metadata: Metadata = {
  title: "Inventory and Sales Management",
  description:
    "Manage products, inventory, POS sales, customers, suppliers, purchases, activity, and reports in one connected system.",
};

export default function HomePage() {
  return <LandingPage />;
}
