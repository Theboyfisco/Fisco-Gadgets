import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import { CartProvider } from "@/components/cart/CartProvider";
import { CompareProvider } from "@/components/product/CompareProvider";
import { Navbar } from "@/components/ui/Navbar";
import { CartWrapper } from "@/components/cart/CartWrapper";
import { Footer } from "@/components/ui/Footer";
import { CompareFloatingBar } from "@/components/product/CompareFloatingBar";

import prisma from "@/lib/db";
import { fallbackCategories } from "@/lib/fallback-data";

export const metadata: Metadata = {
  title: "Fisco Gadgets — Premium Tech Store",
  description: "The official home for premium Apple, Samsung, and high-end tech accessories in Nigeria.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = process.env.DATABASE_URL
    ? await prisma.category
        .findMany({ select: { id: true, name: true } })
        .catch(() => fallbackCategories.map((category) => ({ id: category.id, name: category.name })))
    : fallbackCategories.map((category) => ({ id: category.id, name: category.name }));

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const saved = localStorage.getItem('fisco-theme');
              const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
              const theme = saved || preferred;
              document.documentElement.setAttribute('data-theme', theme);
            } catch {}
          })();`}
        </Script>
      </head>
      <body className="flex min-h-screen flex-col antialiased selection:bg-primary/20 selection:text-[var(--foreground)]">
        <CompareProvider>
          <CartProvider>
            <Navbar categories={categories} />
            {children}
            <Footer categories={categories} />
            <CartWrapper />
            <CompareFloatingBar />
          </CartProvider>
        </CompareProvider>
      </body>
    </html>
  );
}
