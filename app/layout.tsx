import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/components/cart/CartProvider";
import { CompareProvider } from "@/components/product/CompareProvider";
import { WishlistProvider } from "@/components/product/WishlistProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { Navbar } from "@/components/ui/Navbar";
import { CartWrapper } from "@/components/cart/CartWrapper";
import { Footer } from "@/components/ui/Footer";
import { CompareFloatingBar } from "@/components/product/CompareFloatingBar";
import { WishlistWrapper } from "@/components/product/WishlistWrapper";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { PageShell } from "@/components/ui/PageShell";
import { SupportSpeedDial } from "@/components/ui/SupportSpeedDial";
import { PWARegistration } from "@/components/pwa/PWARegistration";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

import prisma from "@/lib/db";
import { fallbackCategories } from "@/lib/fallback-data";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { SITE_NAME, getBaseUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — Premium Tech Store`,
    template: `%s | ${SITE_NAME}`,
  },
  manifest: "/manifest.webmanifest",
  description: "The official home for premium Apple, Samsung, and high-end tech accessories in Nigeria.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} — Premium Tech Store`,
    description: "The official home for premium Apple, Samsung, and high-end tech accessories in Nigeria.",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_NG",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/brand-mark.png", sizes: "256x256", type: "image/png" },
      { url: "/pwa-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/brand-mark.png",
    apple: [{ url: "/pwa-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7ff" },
    { media: "(prefers-color-scheme: dark)", color: "#070b18" },
  ],
};

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = shouldUseDatabase()
    ? await prisma.category
        .findMany({ select: { id: true, name: true, slug: true } })
        .catch(() => fallbackCategories.map((category) => ({ id: category.id, name: category.name, slug: category.slug ?? category.id })))
    : fallbackCategories.map((category) => ({ id: category.id, name: category.name, slug: category.slug ?? category.id }));

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const saved = localStorage.getItem('noxtech-theme');
              const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
              const theme = saved === 'light' || saved === 'dark' ? saved : preferred;
              document.documentElement.setAttribute('data-theme', theme);
              document.documentElement.classList.toggle('dark-theme', theme === 'dark');
              document.documentElement.classList.toggle('light-theme', theme === 'light');
              document.documentElement.style.colorScheme = theme;
            } catch {}
          })();`}
        </Script>
      </head>
      <body
        suppressHydrationWarning
        className={`${manrope.variable} ${spaceGrotesk.variable} flex min-h-screen flex-col overflow-x-hidden antialiased selection:bg-primary/20 selection:text-[var(--foreground)]`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[200] focus:rounded-full focus:bg-[var(--panel-bg)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--foreground)] focus:shadow-xl"
        >
          Skip to content
        </a>
        <ToastProvider>
          <CompareProvider>
            <WishlistProvider>
              <CartProvider>
                <Navbar categories={categories} />
                <ScrollProgress />
                <div id="main-content" className="flex min-h-screen flex-col">
                  <PageShell>{children}</PageShell>
                </div>
                <Footer categories={categories} />
                <CartWrapper />
                <WishlistWrapper />
                <CompareFloatingBar />
                <SupportSpeedDial />
                <PWAInstallPrompt />
                <PWARegistration />
              </CartProvider>
            </WishlistProvider>
          </CompareProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
