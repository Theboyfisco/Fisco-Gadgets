import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { StickyBottomCTA } from "@/components/product/StickyBottomCTA";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Truck, Sparkles, ArrowRight, Star, Package, RefreshCcw, BadgeCheck, Headset, Shield } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { CompareButton } from "@/components/product/CompareButton";
import { WishlistButton } from "@/components/product/WishlistButton";
import { Reveal } from "@/components/ui/Reveal";
import { ProductDepthGallery } from "@/components/product/ProductDepthGallery";
import { RecentlyViewedTracker } from "@/components/ui/RecentlyViewedTracker";
import { RecentlyViewedRail } from "@/components/ui/RecentlyViewedRail";
import { getPrimaryImage, normalizeTechnicalSpecs } from "@/lib/normalize-product";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  const dbProduct = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: { category: true },
  });

  if (!dbProduct) {
    notFound();
  }

  const images = Array.isArray(dbProduct.images) && dbProduct.images.length > 0 ? dbProduct.images : [""];
  const technicalSpecs = normalizeTechnicalSpecs(dbProduct.technicalSpecs);

  const product = {
    id: dbProduct.id,
    name: dbProduct.name,
    price: dbProduct.price,
    image: getPrimaryImage(images),
    categoryId: dbProduct.categoryId,
    brandId: undefined,
    technicalSpecs,
  };

  const condition = String(technicalSpecs.condition || "New");
  const whatsappMsg = encodeURIComponent(`Hi, I want to buy the ${product.name} for ₦${product.price}`);
  const priceLabel = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(product.price);
  const specEntries = Object.entries(technicalSpecs).filter(
    ([key, value]) => key.toLowerCase() !== "condition" && value !== undefined && value !== null && String(value).trim() !== ""
  );
  const highlightOrder = ["storage", "ram", "battery", "display", "screen", "screensize", "processor", "chip", "camera", "network", "os", "color"];
  const normalizedKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "");
  const highlightSpecs = specEntries
    .map(([key, value]) => ({ key, value, rank: highlightOrder.indexOf(normalizedKey(key)) }))
    .sort((a, b) => {
      const rankA = a.rank === -1 ? 999 : a.rank;
      const rankB = b.rank === -1 ? 999 : b.rank;
      if (rankA !== rankB) return rankA - rankB;
      return a.key.localeCompare(b.key);
    })
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-transparent pb-24 lg:pb-12">
      <main className="container mx-auto px-4 pt-8">
        <Reveal className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
            <Link href="/" className="transition-colors hover:text-[var(--foreground)]">
              Home
            </Link>
            <span className="text-[var(--border-strong)]">/</span>
            {dbProduct.category?.name ? (
              <>
                <Link href={`/category/${dbProduct.categoryId}`} className="transition-colors hover:text-[var(--foreground)]">
                  {dbProduct.category.name}
                </Link>
                <span className="text-[var(--border-strong)]">/</span>
              </>
            ) : null}
            <span className="text-[var(--foreground)]">{product.name}</span>
          </div>
        </Reveal>

        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <Reveal>
            <ProductDepthGallery name={product.name} images={images.filter(Boolean)} condition={condition} />
          </Reveal>

          <Reveal delay={0.06} className="flex flex-col">
            <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-6 shadow-[0_24px_80px_rgba(8,18,38,0.16)] backdrop-blur-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex max-w-max items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {condition}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  <Sparkles size={14} className="text-primary" />
                  Premium dispatch
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  <Star size={14} className="text-primary" />
                  Quality checked
                </div>
              </div>

              <h1 className="mb-4 text-4xl font-extrabold tracking-[-0.03em] text-[var(--foreground)] lg:text-5xl">{product.name}</h1>

              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] lg:text-4xl">{priceLabel}</p>
                  <p className="mt-2 text-sm text-secondary">Verified finish, fresh diagnostics, and concierge delivery support from order to handoff.</p>
                </div>
                <div className="rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                  {specEntries.length} specs verified
                </div>
              </div>

              {highlightSpecs.length > 0 ? (
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Key highlights</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {highlightSpecs.map((spec) => (
                      <span
                        key={spec.key}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-1 text-sm font-medium text-[var(--foreground)]"
                      >
                        <span className="text-xs uppercase tracking-[0.18em] text-secondary">
                          {spec.key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        {String(spec.value)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <Truck className="text-secondary" />
                    <div>
                      <p className="text-sm text-secondary">Delivery</p>
                      <p className="font-medium text-[var(--foreground)]">1-3 Days</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-secondary" />
                    <div>
                      <p className="text-sm text-secondary">Warranty</p>
                      <p className="font-medium text-[var(--foreground)]">6 Months</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <AddToCartButton product={product} className="flex-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] py-4 font-bold text-[var(--foreground)] outline-none transition-all hover:bg-[var(--surface-cta)] focus:ring-2 focus:ring-[var(--border-strong)] active:scale-95" />
                <a
                  href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-bold text-[var(--primary-contrast)] shadow-[0_18px_40px_rgba(63,107,253,0.28)] transition-all hover:scale-[1.02] hover:bg-[var(--primary-hover)] active:scale-95"
                >
                  <MessageCircle size={20} />
                  Buy via WhatsApp
                </a>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <CompareButton product={product} showLabel className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 hover:bg-[var(--surface-cta)]" />
                <WishlistButton product={product} showLabel className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 hover:bg-[var(--surface-cta)]" />
                <Link
                  href="#specs"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary transition-colors hover:text-[var(--foreground)]"
                >
                  Full specs
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-4">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-secondary">Authentic</p>
                      <p className="text-sm font-semibold text-[var(--foreground)]">Verified sourcing</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-4">
                  <div className="flex items-center gap-3">
                    <Headset className="text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-secondary">Support</p>
                      <p className="text-sm font-semibold text-[var(--foreground)]">On-demand help</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-secondary">Checkout</p>
                      <p className="text-sm font-semibold text-[var(--foreground)]">Secure pay</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Why this works</p>
                    <p className="mt-2 text-sm text-secondary">Fast shipping, verified stock, and a calmer post-purchase experience than a basic storefront flow.</p>
                  </div>
                  <div className="rounded-full bg-[var(--surface-card)] p-2 text-primary">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-16 max-w-5xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Everything that matters</p>
              <h2 id="specs" className="text-2xl font-bold text-[var(--foreground)]">
                Technical specifications
              </h2>
              <p className="mt-2 text-sm text-secondary">Clear, scannable details to help you decide quickly.</p>
            </div>
            <div className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              {specEntries.length} data points
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass backdrop-blur-md">
            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              {specEntries.map(([key, value]) => (
                <div key={key} className="rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="font-medium text-[var(--foreground)]">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-16 max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[0_18px_60px_rgba(8,18,38,0.18)]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                <Package size={14} className="text-primary" />
                In the box
              </div>
              <h3 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Included accessories</h3>
              <p className="text-sm text-secondary">Everything is packaged for safe delivery with clear setup guidance.</p>
              <div className="mt-4 space-y-2 text-sm font-medium text-[var(--foreground)]">
                <p>Device and protective wrap</p>
                <p>Charging cable and adapter</p>
                <p>Quick start + warranty card</p>
              </div>
            </div>
            <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[0_18px_60px_rgba(8,18,38,0.18)]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                <RefreshCcw size={14} className="text-primary" />
                Returns
              </div>
              <h3 className="mb-3 text-lg font-semibold text-[var(--foreground)]">7-day return window</h3>
              <p className="text-sm text-secondary">Factory-defective items can be returned in their original packaging.</p>
              <Link href="/returns" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary hover:text-[var(--foreground)]">
                See return policy
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[0_18px_60px_rgba(8,18,38,0.18)]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                <ShieldCheck size={14} className="text-primary" />
                Coverage
              </div>
              <h3 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Warranty backed</h3>
              <p className="text-sm text-secondary">6 months of coverage with localized service guidance.</p>
              <Link href="/warranty" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary hover:text-[var(--foreground)]">
                View warranty details
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-16 max-w-5xl">
          <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(135deg,var(--surface-card-strong),var(--surface-card))] p-6 shadow-glass backdrop-blur-md">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Need clarity?</p>
                <h3 className="text-2xl font-bold text-[var(--foreground)]">Quick answers</h3>
              </div>
              <Link href="/terms" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary hover:text-[var(--foreground)]">
                Terms of sale
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Is the device verified?</h4>
                <p className="mt-2 text-sm text-secondary">Each item goes through inspection before dispatch to confirm condition and finish.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">How fast is delivery?</h4>
                <p className="mt-2 text-sm text-secondary">Expect 1-3 days for major cities with tracking from the moment it ships.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">What if I need help?</h4>
                <p className="mt-2 text-sm text-secondary">Message us any time for setup support or quick troubleshooting.</p>
              </div>
            </div>
          </div>
        </Reveal>

        <RecentlyViewedRail />
      </main>

      <StickyBottomCTA product={product} />
      <RecentlyViewedTracker product={product} />
    </div>
  );
}

