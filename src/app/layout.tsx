import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YSI — YUTY_STYLEDIT | Styling You With Finesse",
  description:
    "YSI (YUTY_STYLEDIT) — Premium tailoring, bespoke craftsmanship, and ready-to-wear collections designed to elevate every occasion. Styling You With Finesse.",
  keywords: [
    "YSI",
    "YUTY_STYLEDIT",
    "luxury fashion",
    "bespoke tailoring",
    "ready-to-wear",
    "premium clothing",
    "fashion styling",
  ],
  openGraph: {
    title: "YSI — YUTY_STYLEDIT | Styling You With Finesse",
    description:
      "Premium tailoring, bespoke craftsmanship, and ready-to-wear collections designed to elevate every occasion.",
    type: "website",
    siteName: "YSI",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "YSI — YUTY_STYLEDIT | Styling You With Finesse",
    description:
      "Premium tailoring, bespoke craftsmanship, and ready-to-wear collections.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf6f0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-jet font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}