"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft, Menu, X, Smartphone, Laptop, Headphones, Search, Info, Mail } from "lucide-react";
import { useCart } from "../cart/CartProvider";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";

const SearchOverlay = dynamic(() => import("./SearchOverlay").then((mod) => mod.SearchOverlay), { ssr: false });

interface NavbarProps {
  categories?: { id: string; name: string }[];
}

export function Navbar({ categories = [] }: NavbarProps) {
  const { cartItems, toggleCart } = useCart();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { name: "Home", href: "/", icon: Smartphone },
    ...categories.map((category) => ({
      name: category.name,
      href: `/category/${category.id}`,
      icon:
        category.id === "phones"
          ? Smartphone
          : category.id === "laptops"
            ? Laptop
            : category.id === "audio"
              ? Headphones
              : Smartphone,
    })),
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  const renderSearchOverlay = typeof document !== "undefined";

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b border-white/5 backdrop-blur-2xl transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(7, 9, 15, 0.92)" : "rgba(7, 9, 15, 0.68)",
          paddingTop: scrolled ? "0.2rem" : "0.55rem",
          paddingBottom: scrolled ? "0.2rem" : "0.55rem",
        }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              className="-ml-2 p-2 text-secondary transition-colors hover:text-white lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            {!isHome ? (
              <Link href="/" className="group flex items-center gap-2 text-secondary transition-colors hover:text-white">
                <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                <span className="hidden font-medium sm:inline">Back</span>
              </Link>
            ) : (
              <Link href="/" className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                Fisco Gadgets
              </Link>
            )}
          </div>

          <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? "bg-white/10 text-white" : "text-secondary hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex max-w-sm flex-1 items-center justify-end gap-2 sm:gap-3 lg:max-w-md">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group hidden flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-secondary transition-all hover:bg-white/10 hover:text-white lg:flex"
              aria-label="Open search"
            >
              <Search size={17} className="transition-colors group-hover:text-primary" />
              <span>Search gadgets...</span>
              <kbd className="ml-auto hidden h-5 items-center gap-1 rounded border border-white/10 bg-black/20 px-1.5 font-mono text-[10px] font-medium xl:inline-flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-secondary transition-colors hover:text-white lg:hidden"
              aria-label="Open search"
            >
              <Search size={22} />
            </button>

            <button
              onClick={toggleCart}
              className="relative rounded-xl p-2 text-secondary transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Open cart"
            >
              <ShoppingBag size={23} />
              {cartItems.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[#07090f] bg-primary text-[10px] font-bold text-black">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {renderSearchOverlay &&
        createPortal(<SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />, document.body)}

      {renderSearchOverlay &&
        createPortal(
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", bounce: 0, duration: 0.36 }}
                  className="fixed bottom-0 left-0 top-0 z-[60] flex w-[290px] flex-col border-r border-white/10 bg-[#090c13] p-6 shadow-2xl lg:hidden"
                >
                  <div className="mb-10 flex items-center justify-between">
                    <Link
                      onClick={() => setIsMobileMenuOpen(false)}
                      href="/"
                      className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-xl font-extrabold text-transparent"
                    >
                      Fisco Gadgets
                    </Link>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="-mr-2 p-2 text-secondary transition-colors hover:text-white"
                      aria-label="Close menu"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/60">Navigation</p>
                  <nav className="flex flex-col gap-1.5">
                    {navLinks.map((link) => {
                      const active = pathname === link.href;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-4 rounded-xl border p-3 text-base font-medium transition-all ${
                            active
                              ? "border-primary/35 bg-primary/10 text-primary"
                              : "border-transparent text-secondary hover:border-white/10 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span className={`rounded-lg p-2 ${active ? "bg-primary/20" : "bg-white/5"}`}>
                            <link.icon size={18} />
                          </span>
                          {link.name}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="mt-auto border-t border-white/10 pt-7">
                    <p className="mb-4 text-sm text-secondary">Support available every day via WhatsApp concierge.</p>
                    <Link
                      href="/contact"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-emerald-300"
                    >
                      WhatsApp Support
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
