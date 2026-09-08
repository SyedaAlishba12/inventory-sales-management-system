import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppProviders } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Inventra",
    template: "%s | Inventra",
  },
  description:
    "Inventory and sales management for products, stock, customers, purchases, and reports.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
