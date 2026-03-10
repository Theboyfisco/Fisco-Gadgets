import { BentoProductCard } from "@/components/product/BentoProductCard";
import { Tilt3D } from "@/components/ui/Tilt3D";
import { Reveal } from "@/components/ui/Reveal";
import { ShieldCheck, Truck, Clock, CreditCard, ArrowRight, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { fallbackCategories, fallbackFeaturedProducts } from "@/lib/fallback-data";

function categoryTone(categoryId: string) {
  if (categoryId === "phones") return "from-cyan-500/45";
  if (categoryId === "laptops") return "from-indigo-500/45";
  if (categoryId === "audio") return "from-fuchsia-500/45";
  return "from-emerald-500/45";
}

const heroBackdrop =
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1920&auto=format&fit=crop";

export default async function Home() {
  const [dbProducts, dbCategories] = process.env.DATABASE_URL
    ? await Promise.all([
        prisma.product
          .findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: { category: true },
          })
          .catch(() => []),
        prisma.category.findMany().catch(() => fallbackCategories),
      ])
    : [[], fallbackCategories];

  const featuredProducts =
    dbProducts.length > 0
      ? dbProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images[0],
          categoryId: p.categoryId,
          technicalSpecs: p.technicalSpecs as any,
        }))
      : fallbackFeaturedProducts;

  const leadProduct = featuredProducts[0] ?? fallbackFeaturedProducts[0];

  return (
    <div className="min-h-screen pb-24">
      <main className="container relative mx-auto overflow-hidden px-4 pt-8 sm:pt-12">
        <section className="relative mb-20 overflow-hidden rounded-[2rem] border border-white/15 bg-black/30 p-8 shadow-[0_30px_80px_rgba(8,14,30,0.65)] lg:mb-24 lg:p-12">
          <Image src={heroBackdrop} alt="Futuristic gadgets background" fill className="object-cover opacity-45" priority quality={95} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.25),transparent_35%),radial-gradient(circle_at_80%_25%,rgba(16,185,129,0.25),transparent_35%),linear-gradient(to_bottom,rgba(5,8,16,0.2),rgba(5,8,16,0.85))]" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <div>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                  <Sparkles size={14} />
                  Next-gen gadget experience
                </p>
                <h1 className="mb-6 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
                  A cinematic 3D storefront built for premium tech shopping.
                </h1>
                <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
                  Explore curated devices with immersive visuals, transparent pricing, and verified stock updates across Nigeria.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="#featured"
                    className="inline-flex items-center justify-center gap-2 rounded-standard bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition-all hover:scale-[1.02]"
                  >
                    Shop Featured
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/category/phones"
                    className="inline-flex items-center justify-center rounded-standard border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    Browse Collection
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="mx-auto hidden w-full max-w-xl lg:block">
              <Tilt3D maxTilt={8} spotlightOpacity={0.4}>
                <div className="relative h-[29rem] overflow-hidden rounded-[1.8rem] border border-white/20 bg-gradient-to-b from-white/15 to-white/[0.04] p-6 shadow-2xl">
                  <div className="absolute left-5 top-5 rounded-full border border-white/50 bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white [transform:translateZ(40px)]">
                    Hero Product
                  </div>

                  <div className="relative h-full w-full [transform-style:preserve-3d]">
                    <Image
                      src={leadProduct?.image || "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop"}
                      alt={leadProduct?.name || "Featured Product"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={95}
                      priority
                      className="object-contain p-10 [transform:translateZ(48px)_scale(1.04)]"
                    />
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-black/45 p-5 backdrop-blur-md [transform:translateZ(55px)]">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">Recommended today</p>
                    <h4 className="text-lg font-bold text-white">{leadProduct?.name || "New Arrival"}</h4>
                    <p className="text-base font-semibold text-emerald-300">
                      {leadProduct
                        ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(leadProduct.price)
                        : "Coming Soon"}
                    </p>
                  </div>
                </div>
              </Tilt3D>
            </Reveal>
          </div>
        </section>

        <Reveal className="mb-20 lg:mb-24">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {dbCategories.map((category: any) => (
              <Tilt3D key={category.id} maxTilt={5} spotlightOpacity={0.28}>
                <Link
                  href={`/category/${category.id}`}
                  className="group relative block h-44 overflow-hidden rounded-featured border border-white/20 bg-black/20"
                >
                  <Image src={category.image} alt={category.name} fill sizes="(max-width: 768px) 50vw, 25vw" quality={90} className="object-cover opacity-75 transition-transform duration-500 group-hover:scale-110" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${categoryTone(category.id)} via-black/35 to-black/80`} />
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/20 bg-black/35 px-3 py-2 backdrop-blur-sm">
                    <h3 className="text-sm font-semibold text-white sm:text-base">{category.name}</h3>
                  </div>
                </Link>
              </Tilt3D>
            ))}
          </div>
        </Reveal>

        <Reveal className="mb-20 rounded-2xl border border-white/15 bg-gradient-to-r from-white/[0.07] to-white/[0.02] p-6 md:mb-24 md:p-10" delay={0.05}>
          <div className="grid gap-8 md:grid-cols-4 md:gap-6">
            {[Truck, ShieldCheck, CreditCard, Clock].map((Icon, idx) => (
              <div key={idx} className="text-center">
                <Icon size={30} className="mx-auto mb-3 text-cyan-200" />
                <h3 className="mb-2 text-sm font-semibold text-white">{["Fast Delivery", "Authentic Warranty", "Secure Payments", "24/7 Help"][idx]}</h3>
                <p className="text-xs leading-relaxed text-slate-300">{["Same day in Asaba, 1-3 days nationwide.", "Manufacturer-backed and store-covered support.", "Paystack, transfer, and verified payment flow.", "Live WhatsApp concierge whenever you need it."][idx]}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <section id="featured">
          <Reveal>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Featured Deals</h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-200">
                <Star size={12} /> Most wanted this week
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product: any, index: number) => (
                <Link href={`/product/${product.id}`} key={product.id} className={index === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
                  <BentoProductCard product={product as any} featured={index === 0} />
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
