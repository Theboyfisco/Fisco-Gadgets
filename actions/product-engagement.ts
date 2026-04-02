"use server";

import { z } from "zod";
import prisma from "@/lib/db";
import { getCurrentCustomer } from "@/lib/customer-auth";

const ReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(8).max(1200),
});

const QuestionSchema = z.object({
  productId: z.string().min(1),
  question: z.string().trim().min(8).max(1200),
  name: z.string().trim().max(120).optional(),
  email: z.string().email().optional(),
});

const AlertSchema = z.object({
  productId: z.string().min(1),
  email: z.string().email(),
});

export async function getProductEngagement(productId: string) {
  const [reviews, questions] = await Promise.all([
    prisma.productReview.findMany({
      where: { productId },
      include: {
        customer: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.productQuestion.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const ratingAverage =
    reviews.length > 0 ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0;

  return {
    reviews: reviews.map((item) => ({
      id: item.id,
      rating: item.rating,
      title: item.title,
      body: item.body,
      verifiedPurchase: item.verifiedPurchase,
      createdAt: item.createdAt.toISOString(),
      author: item.customer.fullName || item.customer.email,
    })),
    questions: questions.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      name: item.name || "Customer",
    })),
    ratingAverage,
    ratingCount: reviews.length,
  };
}

export async function submitProductReview(input: z.infer<typeof ReviewSchema>) {
  const parsed = ReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid review input." };
  }

  const customer = await getCurrentCustomer();
  if (!customer) {
    return { success: false, error: "Sign in to submit a review." };
  }

  const hasPurchase = await prisma.order.findFirst({
    where: {
      OR: [{ customerId: customer.id }, { email: customer.email }],
      status: "PAID",
      items: { some: { productId: parsed.data.productId } },
    },
    select: { id: true },
  });

  const review = await prisma.productReview.upsert({
    where: {
      productId_customerId: {
        productId: parsed.data.productId,
        customerId: customer.id,
      },
    },
    update: {
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
      verifiedPurchase: Boolean(hasPurchase),
      updatedAt: new Date(),
    },
    create: {
      productId: parsed.data.productId,
      customerId: customer.id,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
      verifiedPurchase: Boolean(hasPurchase),
    },
  });

  return { success: true, reviewId: review.id };
}

export async function submitProductQuestion(input: z.infer<typeof QuestionSchema>) {
  const parsed = QuestionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid question input." };
  }

  const customer = await getCurrentCustomer();
  const row = await prisma.productQuestion.create({
    data: {
      productId: parsed.data.productId,
      customerId: customer?.id,
      name: parsed.data.name || customer?.fullName || null,
      email: parsed.data.email || customer?.email || null,
      question: parsed.data.question,
      status: "OPEN",
    },
  });

  return { success: true, questionId: row.id };
}

export async function subscribeBackInStock(input: z.infer<typeof AlertSchema>) {
  const parsed = AlertSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid email." };
  }

  const customer = await getCurrentCustomer();

  await prisma.backInStockAlert.upsert({
    where: {
      productId_email: {
        productId: parsed.data.productId,
        email: parsed.data.email.toLowerCase().trim(),
      },
    },
    update: {
      customerId: customer?.id ?? null,
      notifiedAt: null,
      createdAt: new Date(),
    },
    create: {
      productId: parsed.data.productId,
      customerId: customer?.id ?? null,
      email: parsed.data.email.toLowerCase().trim(),
    },
  });

  return { success: true };
}
