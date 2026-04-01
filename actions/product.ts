"use server";

import prisma from "@/lib/db";

export async function searchProducts(query: string) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
        return prisma.product.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                price: true,
                images: true,
                categoryId: true,
                technicalSpecs: true,
            },
        });
    }

    if (trimmedQuery.length < 2) {
        return [];
    }

    return prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: trimmedQuery, mode: 'insensitive' } },
                { description: { contains: trimmedQuery, mode: 'insensitive' } },
                { category: { name: { contains: trimmedQuery, mode: 'insensitive' } } }
            ]
        },
        take: 10,
        select: {
            id: true,
            name: true,
            price: true,
            images: true,
            categoryId: true,
            technicalSpecs: true,
        },
    });
}
