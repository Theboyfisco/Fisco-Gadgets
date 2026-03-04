import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

import { CompareFloatingBar } from "@/components/product/CompareFloatingBar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true }
  });

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary/20 selection:text-white flex flex-col min-h-screen`}
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
