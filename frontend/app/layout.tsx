import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketPulse AI — Marketing Decision Intelligence",
  description: "Predict campaign success, ROI, CAC, and revenue with explainable AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
