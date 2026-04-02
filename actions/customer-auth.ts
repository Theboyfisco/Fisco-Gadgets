"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import {
  authenticateCustomer,
  clearCustomerSession,
  createCustomerSession,
  createCustomerUser,
  getCurrentCustomer,
} from "@/lib/customer-auth";

const RegisterSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120).optional(),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const LoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export async function registerCustomer(input: z.infer<typeof RegisterSchema>) {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.customer.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const customer = await createCustomerUser({
    email: normalizedEmail,
    fullName: parsed.data.fullName,
    password: parsed.data.password,
  });

  await createCustomerSession(customer.id);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function loginCustomer(input: z.infer<typeof LoginSchema>) {
  const parsed = LoginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const customer = await authenticateCustomer(parsed.data.email, parsed.data.password);
  if (!customer) {
    return { success: false, error: "Invalid email or password." };
  }

  await createCustomerSession(customer.id);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function logoutCustomer() {
  await clearCustomerSession();
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getCustomerViewer() {
  const customer = await getCurrentCustomer();
  return customer;
}
