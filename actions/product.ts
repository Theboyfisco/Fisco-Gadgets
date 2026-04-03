"use server";

import prisma from "@/lib/db";
import { fallbackCategories, fallbackFeaturedProducts } from "@/lib/fallback-data";
import { shouldUseDatabase } from "@/lib/should-use-database";

function normalize(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function levenshtein(a: string, b: string) {
    const matrix = Array.from({ length: b.length + 1 }, () => Array(a.length + 1).fill(0));
    for (let i = 0; i <= b.length; i += 1) matrix[i][0] = i;
    for (let j = 0; j <= a.length; j += 1) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i += 1) {
        for (let j = 1; j <= a.length; j += 1) {
            const cost = b[i - 1] === a[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost,
            );
        }
    }
    return matrix[b.length][a.length];
}

const SYNONYMS: Record<string, string[]> = {
    iphone: ["ios", "apple phone", "apple smartphone"],
    macbook: ["laptop", "notebook", "mac"],
    airpods: ["earbuds", "buds", "wireless earphones"],
    samsung: ["galaxy"],
    charger: ["power adapter", "charging brick", "usb-c charger"],
    watch: ["smartwatch", "wearable"],
};

function buildQueryVariants(query: string) {
    const normalized = normalize(query);
    const variants = new Set<string>([normalized]);
    normalized.split(" ").forEach((token) => {
        if (SYNONYMS[token]) {
            SYNONYMS[token].forEach((syn) => variants.add(syn));
        }
    });
    return Array.from(variants).filter(Boolean);
}

function scoreProduct(product: any, variants: string[]) {
    const name = normalize(product.name || "");
    const description = normalize(product.description || "");
    const brand = normalize(product.brand?.name || "");
    const category = normalize(product.category?.name || "");
    const specs = normalize(
        Object.entries((product.technicalSpecs as Record<string, string | number | boolean>) || {})
            .map(([key, value]) => `${key} ${String(value)}`)
            .join(" "),
    );
    const searchable = `${name} ${description} ${brand} ${category} ${specs}`.trim();

    let score = 0;
    for (const variant of variants) {
        if (!variant) continue;

        if (name === variant) score += 120;
        if (name.startsWith(variant)) score += 95;
        if (name.includes(variant)) score += 70;
        if (brand.includes(variant)) score += 60;
        if (category.includes(variant)) score += 48;
        if (specs.includes(variant)) score += 42;
        if (description.includes(variant)) score += 24;
        if (searchable.includes(variant)) score += 12;

        const nameDistance = levenshtein(name.slice(0, Math.max(variant.length, 4)), variant);
        if (nameDistance <= 2) {
            score += 20 - nameDistance * 6;
        }
    }

    if (typeof product.stock === "number" && product.stock > 0) {
        score += 8;
    }

    return score;
}

function buildFallbackSearchPool() {
    const categoryNameById = new Map(
        fallbackCategories.map((category) => [category.slug ?? category.id, category.name]),
    );

    return fallbackFeaturedProducts.map((item, index) => ({
        id: item.id,
        name: item.name,
        slug: item.slug ?? item.id,
        description: "",
        price: item.price,
        stock: typeof item.stock === "number" ? item.stock : 0,
        images: [item.image],
        categoryId: item.categoryId,
        brandId: item.brandId ?? null,
        technicalSpecs: item.technicalSpecs,
        brand: item.brandId
            ? { name: item.brandId.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) }
            : null,
        category: { name: categoryNameById.get(item.categoryId) ?? item.categoryId },
        createdAt: new Date(Date.UTC(2024, 0, 1 + index)),
        updatedAt: new Date(Date.UTC(2024, 0, 1 + index)),
    }));
}

function mapSearchProduct(product: any) {
    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        images: product.images,
        categoryId: product.categoryId,
        brandId: product.brandId,
        technicalSpecs: product.technicalSpecs,
        brand: product.brand,
        category: product.category,
    };
}

function searchInMemoryProducts(products: any[], query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
        return products.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
    }

    if (trimmedQuery.length < 2) {
        return [];
    }

    const variants = buildQueryVariants(trimmedQuery);
    const ranked = products
        .map((product) => ({ product, score: scoreProduct(product, variants) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || b.product.updatedAt.getTime() - a.product.updatedAt.getTime())
        .slice(0, 10)
        .map((entry) => entry.product);

    if (ranked.length > 0) {
        return ranked;
    }

    return products
        .filter((product) => typeof product.stock === "number" && product.stock > 0)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 6);
}

export async function searchProducts(query: string) {
    const trimmedQuery = query.trim();
    if (!shouldUseDatabase()) {
        const fallbackMatches = searchInMemoryProducts(buildFallbackSearchPool(), trimmedQuery);
        return fallbackMatches.map(mapSearchProduct);
    }

    const variants = buildQueryVariants(trimmedQuery);

    if (!trimmedQuery) {
        const latest = await prisma.product.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                stock: true,
                images: true,
                categoryId: true,
                brandId: true,
                technicalSpecs: true,
                brand: { select: { name: true } },
                category: { select: { name: true } },
            },
        });
        return latest;
    }

    if (trimmedQuery.length < 2) {
        return [];
    }

    const candidates = await prisma.product.findMany({
        where: {
            OR: [
                ...variants.map((term) => ({ name: { contains: term, mode: 'insensitive' as const } })),
                ...variants.map((term) => ({ description: { contains: term, mode: 'insensitive' as const } })),
                ...variants.map((term) => ({ category: { name: { contains: term, mode: 'insensitive' as const } } })),
                ...variants.map((term) => ({ brand: { name: { contains: term, mode: 'insensitive' as const } } })),
            ],
        },
        take: 60,
        include: {
            brand: { select: { name: true } },
            category: { select: { name: true } },
        },
    });

    const ranked = candidates
        .map((product) => ({ product, score: scoreProduct(product, variants) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || b.product.createdAt.getTime() - a.product.createdAt.getTime())
        .slice(0, 10)
        .map((entry) => mapSearchProduct(entry.product));

    if (ranked.length > 0) {
        return ranked;
    }

    // Fallback recovery: return recent in-stock options when query has no direct matches.
    const fallback = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
            brand: { select: { name: true } },
            category: { select: { name: true } },
        },
    });

    return fallback.map((entry) => mapSearchProduct(entry));
}

export async function searchProductsPaginated(query: string, page = 1, pageSize = 24) {
    const trimmedQuery = query.trim();
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safePageSize = Math.min(Math.max(Math.floor(pageSize), 1), 60);

    if (!shouldUseDatabase()) {
        const matches = searchInMemoryProducts(buildFallbackSearchPool(), trimmedQuery);
        const total = matches.length;
        const start = (safePage - 1) * safePageSize;
        return {
            total,
            page: safePage,
            pageSize: safePageSize,
            items: matches.slice(start, start + safePageSize).map(mapSearchProduct),
        };
    }

    if (!trimmedQuery || trimmedQuery.length < 2) {
        return { total: 0, page: safePage, pageSize: safePageSize, items: [] as any[] };
    }

    const variants = buildQueryVariants(trimmedQuery);
    const where = {
        OR: [
            ...variants.map((term) => ({ name: { contains: term, mode: 'insensitive' as const } })),
            ...variants.map((term) => ({ description: { contains: term, mode: 'insensitive' as const } })),
            ...variants.map((term) => ({ category: { name: { contains: term, mode: 'insensitive' as const } } })),
            ...variants.map((term) => ({ brand: { name: { contains: term, mode: 'insensitive' as const } } })),
        ],
    };

    const [total, rows] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            include: {
                brand: { select: { name: true } },
                category: { select: { name: true } },
            },
            orderBy: [{ updatedAt: "desc" }],
            skip: (safePage - 1) * safePageSize,
            take: safePageSize,
        }),
    ]);

    return {
        total,
        page: safePage,
        pageSize: safePageSize,
        items: rows.map((row) => mapSearchProduct(row)),
    };
}
