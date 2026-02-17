import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Tripilot — AI Travel Planner",
  description: "Plan your dream trip with an AI copilot. Explore the world map, build itineraries, and book flights & hotels.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen font-[family-name:var(--font-inter)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
