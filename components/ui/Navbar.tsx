"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, Smartphone, Laptop, Headphones, Search, Info, Mail, Heart, UserCircle2 } from "lucide-react";
import { useCart } from "../cart/CartProvider";
import { useWishlist } from "../product/WishlistProvider";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

  const hydrated = useHydrated();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const browseMenuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!isBrowseOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!browseMenuRef.current) return;
      if (browseMenuRef.current.contains(event.target as Node)) return;
      setIsBrowseOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsBrowseOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isBrowseOpen]);

  const categoryLinks = categories.map((category) => {
    const categoryKey = (category.slug ?? category.id).toLowerCase();

    return {
      name: category.name,
      href: `/category/${category.slug ?? category.id}`,
      icon:
        categoryKey === "phones"
          ? Smartphone
          : categoryKey === "laptops"
            ? Laptop
            : categoryKey === "audio"
              ? Headphones
              : Smartphone,
    };
  });

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
  const iconButtonClass =
    "interactive-focus relative flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-secondary transition-colors hover:border-[var(--interactive-border)] hover:bg-[var(--interactive-active)] hover:text-[var(--interactive-fg)] sm:h-10 sm:w-10";

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] backdrop-blur-2xl transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)]"
        style={{
          backgroundColor: scrolled ? "var(--nav-bg-scrolled)" : "var(--nav-bg)",
          paddingTop: scrolled ? "0.2rem" : "0.4rem",
          paddingBottom: scrolled ? "0.2rem" : "0.4rem",
        }}
      >
        <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-2.5 sm:px-4 xl:h-[4.1rem] xl:gap-3">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <button
              className="interactive-focus -ml-0.5 rounded-xl p-1.5 text-secondary transition-colors hover:bg-[var(--interactive-hover)] hover:text-[var(--foreground)] max-[380px]:p-1 sm:-ml-1 sm:p-2 xl:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu size={24} />
            </button>
            <BrandLogo />
          </div>

          <nav className="hidden min-w-0 flex-none items-center gap-1.5 overflow-x-auto overflow-y-visible rounded-full border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--interactive-bg-soft),var(--surface-soft))] px-2.5 py-1.5 shadow-[0_16px_44px_rgba(8,18,38,0.08)] no-scrollbar xl:flex xl:max-w-[min(58vw,48rem)] 2xl:max-w-none 2xl:px-3">
            {navLinks.map((link, index) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    index >= 5 ? "xl:hidden 2xl:inline-flex" : ""
                  } ${
                    active
                      ? "interactive-focus bg-[var(--interactive-active)] text-[var(--interactive-fg)]"
                      : "interactive-focus text-secondary hover:bg-[var(--interactive-hover)] hover:text-[var(--interactive-fg)]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            {showMegaMenu ? (
              <div ref={browseMenuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBrowseOpen((prev) => !prev)}
                  aria-expanded={isBrowseOpen}
                  aria-haspopup="menu"
                  className={`interactive-focus rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isBrowseOpen
                      ? "bg-[var(--interactive-active)] text-[var(--interactive-fg)]"
                      : "text-secondary hover:bg-[var(--interactive-hover)] hover:text-[var(--interactive-fg)]"
                  }`}
                >
                  Browse
                </button>
                <AnimatePresence>
                  {isBrowseOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
                      className="absolute right-0 top-12 z-[70] w-[560px] rounded-[1.75rem] border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--panel-bg-soft),var(--surface-card))] p-4 shadow-2xl backdrop-blur-2xl"
                    >
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
                                  onClick={() => setIsBrowseOpen(false)}
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
                            onClick={() => setIsBrowseOpen(false)}
                            className="block rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                          >
                            Compare devices
                            <p className="mt-2 text-xs font-normal text-secondary">Line up specs side by side.</p>
                          </Link>
                          <Link
                            href="/browse"
                            onClick={() => setIsBrowseOpen(false)}
                            className="block rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                          >
                            Browse all products
                            <p className="mt-2 text-xs font-normal text-secondary">Full catalog with filters.</p>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/browse"
                className="interactive-focus shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-[var(--interactive-hover)] hover:text-[var(--interactive-fg)]"
              >
                Browse
              </Link>
            )}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-1.5 xl:ml-2 xl:gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="interactive-focus group hidden w-[clamp(10rem,14vw,13rem)] items-center gap-3 rounded-full border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--interactive-bg-soft),var(--surface-soft))] px-3.5 py-2 text-sm text-secondary shadow-[0_16px_40px_rgba(8,18,38,0.06)] transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:bg-[var(--interactive-active)] hover:text-[var(--interactive-fg)] xl:flex"
              aria-label="Open search"
            >
              <Search size={17} className="transition-colors group-hover:text-primary" />
              <span>Search gadgets...</span>
              <kbd className="ml-auto hidden h-5 items-center gap-1 rounded border border-[var(--border-subtle)] bg-[var(--kbd-bg)] px-1.5 font-mono text-[10px] font-medium 2xl:inline-flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="interactive-focus flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-[var(--interactive-hover)] hover:text-[var(--foreground)] sm:h-10 sm:w-10 xl:hidden"
              aria-label="Open search"
            >
              <Search size={20} />
            </button>

            <ThemeSwitcher />
            <Link
              href="/account/orders"
              className={iconButtonClass}
              aria-label="Account"
            >
              <UserCircle2 size={20} />
            </Link>
            <button
              onClick={toggleWishlistDrawer}
              className={iconButtonClass}
              aria-label="View wishlist"
              aria-expanded={isWishlistOpen}
              aria-controls="wishlist-drawer"
            >
              <Heart size={20} />
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
              className={iconButtonClass}
              aria-label="Open cart"
              aria-expanded={cartItems.length > 0}
              aria-controls="cart-drawer"
            >
              <ShoppingBag size={20} />
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
                  className="fixed bottom-0 left-0 top-0 z-[60] flex w-[304px] max-w-[86vw] flex-col border-r border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--mobile-drawer-bg),var(--surface-card))] p-5 shadow-2xl backdrop-blur-2xl lg:hidden sm:w-[320px] sm:p-6"
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

