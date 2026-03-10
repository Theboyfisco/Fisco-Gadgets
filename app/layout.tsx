import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Fisco Gadgets — Premium Tech Store",
  description: "The official home for premium Apple, Samsung, and high-end tech accessories in Nigeria.",
};

import { CartProvider } from "@/components/cart/CartProvider";
import { CompareProvider } from "@/components/product/CompareProvider";
import { Navbar } from "@/components/ui/Navbar";
import { CartWrapper } from "@/components/cart/CartWrapper";
import { Footer } from "@/components/ui/Footer";

import prisma from "@/lib/db";
import { fallbackCategories } from "@/lib/fallback-data";

import { CompareFloatingBar } from "@/components/product/CompareFloatingBar";

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
    <html lang="en" className="dark">
      <body
        className="antialiased selection:bg-primary/20 selection:text-white flex min-h-screen flex-col"
      >
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
