import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SpyBase — Free OSINT & Email Intelligence",
  description:
    "SpyBase is a free and open intelligence platform. Reverse-lookup emails, surface data breaches, inspect infostealer logs, map connections, and monitor exposure — every feature, free forever.",
  keywords: [
    "OSINT",
    "email intelligence",
    "breach lookup",
    "infostealer logs",
    "reverse email",
    "threat intelligence",
    "free OSINT",
    "SpyBase",
  ],
  openGraph: {
    title: "SpyBase — Free OSINT & Email Intelligence",
    description:
      "From a single email to actionable intelligence. Every feature. Free forever.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
