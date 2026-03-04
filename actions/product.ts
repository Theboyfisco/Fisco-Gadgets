"use server";

import prisma from "@/lib/db";

export async function searchProducts(query: string) {
    if (!query || query.trim().length === 0) {
        return prisma.product.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { category: true }
        });
    }

    return prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { category: { name: { contains: query, mode: 'insensitive' } } }
            ]
        },
        take: 10,
        include: { category: true }
    });
}
