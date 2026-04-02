"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft, Menu, X, Smartphone, Laptop, Headphones, Search, Info, Mail, Heart, UserCircle2 } from "lucide-react";
import { useCart } from "../cart/CartProvider";
import { useWishlist } from "../product/WishlistProvider";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { BrandLogo } from "./BrandLogo";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { MOTION } from "@/lib/motion";
import { useHydrated } from "@/lib/useHydrated";

const SearchOverlay = dynamic(() => import("./SearchOverlay").then((mod) => mod.SearchOverlay), { ssr: false });

interface NavbarProps {
  categories?: { id: string; name: string; slug?: string }[];
}

export function Navbar({ categories = [] }: NavbarProps) {
  const { cartItems, toggleCart } = useCart();
  const { wishlistItems, toggleWishlistDrawer, isWishlistOpen } = useWishlist();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const hydrated = useHydrated();
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

  const categoryLinks = categories.map((category) => ({
    name: category.name,
    href: `/category/${category.slug ?? category.id}`,
    icon:
      category.id === "phones"
        ? Smartphone
        : category.id === "laptops"
          ? Laptop
          : category.id === "audio"
            ? Headphones
            : Smartphone,
  }));

  const coreLinks = [
    { name: "Home", href: "/", icon: Smartphone },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  const visibleCategories = categoryLinks.slice(0, 3);
  const navLinks = [coreLinks[0], ...visibleCategories, ...coreLinks.slice(1)];
  const showMegaMenu = categoryLinks.length > visibleCategories.length;

  const renderSearchOverlay = hydrated;
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] backdrop-blur-2xl transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)]"
        style={{
          backgroundColor: scrolled ? "var(--nav-bg-scrolled)" : "var(--nav-bg)",
          paddingTop: scrolled ? "0.2rem" : "0.55rem",
          paddingBottom: scrolled ? "0.2rem" : "0.55rem",
        }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              className="interactive-focus -ml-2 rounded-xl p-2 text-secondary transition-colors hover:bg-[var(--interactive-hover)] hover:text-[var(--foreground)] lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu size={24} />
            </button>

            {!isHome ? (
              <Link href="/" className="interactive-focus group rounded-xl px-2 py-1.5 text-secondary transition-colors hover:bg-[var(--interactive-hover)] hover:text-[var(--foreground)]">
                <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                <span className="hidden font-medium sm:inline">Back</span>
              </Link>
            ) : (
              <BrandLogo />
            )}
          </div>

          <nav className="hidden items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--interactive-bg-soft),var(--surface-soft))] px-3 py-1 shadow-[0_16px_44px_rgba(8,18,38,0.08)] lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "interactive-focus bg-[var(--interactive-active)] text-[var(--interactive-fg)]"
                      : "interactive-focus text-secondary hover:bg-[var(--interactive-hover)] hover:text-[var(--interactive-fg)]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            {showMegaMenu && (
              <details className="group relative">
                <summary className="interactive-focus list-none rounded-full px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-[var(--interactive-hover)] hover:text-[var(--interactive-fg)] [&::-webkit-details-marker]:hidden">
                  Browse
                </summary>
                <div className="absolute right-0 top-12 z-50 w-[560px] rounded-[1.75rem] border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--panel-bg-soft),var(--surface-card))] p-4 shadow-2xl backdrop-blur-2xl">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Categories</p>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryLinks.map((link) => {
                          const active = pathname === link.href;
                          return (
                            <Link
                              key={link.name}
                              href={link.href}
                              aria-current={active ? "page" : undefined}
                              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                                active
                                  ? "bg-[var(--interactive-active)] text-[var(--interactive-fg)]"
                                  : "text-secondary hover:bg-[var(--interactive-hover)] hover:text-[var(--interactive-fg)]"
                              }`}
                            >
                              <link.icon size={16} className="text-primary" />
                              {link.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Link
                        href="/compare"
                        className="block rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                      >
                        Compare devices
                        <p className="mt-2 text-xs font-normal text-secondary">Line up specs side by side.</p>
                      </Link>
                      <Link
                        href="/#featured"
                        className="block rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                      >
                        Featured drops
                        <p className="mt-2 text-xs font-normal text-secondary">Curated deals this week.</p>
                      </Link>
                    </div>
                  </div>
                </div>
              </details>
            )}
          </nav>

          <div className="flex max-w-sm flex-1 items-center justify-end gap-2 sm:gap-3 lg:max-w-md">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="interactive-focus group hidden flex-1 items-center gap-3 rounded-full border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--interactive-bg-soft),var(--surface-soft))] px-4 py-2 text-sm text-secondary shadow-[0_16px_40px_rgba(8,18,38,0.06)] transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:bg-[var(--interactive-active)] hover:text-[var(--interactive-fg)] lg:flex"
              aria-label="Open search"
            >
              <Search size={17} className="transition-colors group-hover:text-primary" />
              <span>Search gadgets...</span>
              <kbd className="ml-auto hidden h-5 items-center gap-1 rounded border border-[var(--border-subtle)] bg-[var(--kbd-bg)] px-1.5 font-mono text-[10px] font-medium xl:inline-flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="interactive-focus rounded-xl p-2 text-secondary transition-colors hover:bg-[var(--interactive-hover)] hover:text-[var(--foreground)] lg:hidden"
              aria-label="Open search"
            >
              <Search size={22} />
            </button>

            <ThemeSwitcher />
            <Link
              href="/account/orders"
              className="interactive-focus relative rounded-xl border border-transparent p-2 text-secondary transition-colors hover:border-[var(--interactive-border)] hover:bg-[var(--interactive-active)] hover:text-[var(--interactive-fg)]"
              aria-label="Account"
            >
              <UserCircle2 size={22} />
            </Link>
            <button
              onClick={toggleWishlistDrawer}
              className="interactive-focus relative rounded-xl border border-transparent p-2 text-secondary transition-colors hover:border-[var(--interactive-border)] hover:bg-[var(--interactive-active)] hover:text-[var(--interactive-fg)]"
              aria-label="View wishlist"
              aria-expanded={isWishlistOpen}
              aria-controls="wishlist-drawer"
            >
              <Heart size={22} />
              <span
                suppressHydrationWarning
                className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--background)] bg-primary text-[10px] font-bold text-[var(--primary-contrast)] transition-opacity duration-[var(--motion-base)] ease-[var(--ease-standard)] ${
                  wishlistItems.length > 0 ? "opacity-100" : "opacity-0"
                }`}
              >
                {wishlistItems.length}
              </span>
            </button>
            <button
              onClick={toggleCart}
              className="interactive-focus relative rounded-xl border border-transparent p-2 text-secondary transition-colors hover:border-[var(--interactive-border)] hover:bg-[var(--interactive-active)] hover:text-[var(--interactive-fg)]"
              aria-label="Open cart"
              aria-expanded={cartItems.length > 0}
              aria-controls="cart-drawer"
            >
              <ShoppingBag size={23} />
              <span
                suppressHydrationWarning
                className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--background)] bg-primary text-[10px] font-bold text-[var(--primary-contrast)] transition-opacity duration-[var(--motion-base)] ease-[var(--ease-standard)] ${
                  cartCount > 0 ? "opacity-100" : "opacity-0"
                }`}
              >
                {cartCount}
              </span>
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
                  className="fixed inset-0 z-50 bg-[var(--overlay)] backdrop-blur-sm lg:hidden"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", bounce: 0, duration: MOTION.duration.slow }}
                  className="fixed bottom-0 left-0 top-0 z-[60] flex w-[320px] max-w-[86vw] flex-col border-r border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--mobile-drawer-bg),var(--surface-card))] p-6 shadow-2xl backdrop-blur-2xl lg:hidden"
                  id="mobile-menu"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <BrandLogo onClick={() => setIsMobileMenuOpen(false)} />
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="interactive-focus -mr-2 rounded-xl p-2 text-secondary transition-colors hover:bg-[var(--interactive-hover)] hover:text-[var(--foreground)]"
                      aria-label="Close menu"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="mb-6 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
                    <p className="text-soft text-[10px] font-bold uppercase tracking-[0.2em]">Navigation</p>
                    <p className="mt-2 text-sm text-secondary">Browse categories, compare devices, or jump back into your saved items.</p>
                  </div>
                  <nav className="flex flex-col gap-1.5">
                    {navLinks.map((link) => {
                      const active = pathname === link.href;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-4 rounded-xl border p-3 text-base font-medium transition-all ${
                            active
                              ? "interactive-focus border-primary/35 bg-primary/10 text-primary"
                              : "interactive-focus border-transparent text-secondary hover:border-[var(--interactive-border)] hover:bg-[var(--interactive-hover)] hover:text-[var(--interactive-fg)]"
                          }`}
                        >
                          <span className={`rounded-lg p-2 ${active ? "bg-primary/20" : "bg-[var(--interactive-bg)]"}`}>
                            <link.icon size={18} />
                          </span>
                          {link.name}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        toggleWishlistDrawer();
                      }}
                      className="interactive-focus rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-3 text-left"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">Wishlist</p>
                      <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{wishlistItems.length}</p>
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        toggleCart();
                      }}
                      className="interactive-focus rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-3 text-left"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">Cart</p>
                      <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{cartCount}</p>
                    </button>
                  </div>

                  <div className="mt-auto border-t border-[var(--border-subtle)] pt-7">
                    <p className="mb-4 text-sm text-secondary">Support available every day via WhatsApp concierge.</p>
                    <Link
                      href="/contact"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="interactive-focus primary-action block w-full rounded-full py-3 text-center text-sm font-semibold transition-colors"
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

