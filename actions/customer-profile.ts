"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireCustomer } from "@/lib/customer-auth";

const UpdateProfileSchema = z.object({
  fullName: z.string().trim().max(120, "Full name must be 120 characters or less."),
});

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters.").max(72, "New password is too long."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match.",
    path: ["confirmPassword"],
  });

export async function updateCustomerProfile(input: z.infer<typeof UpdateProfileSchema>) {
  const parsed = UpdateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid profile details." };
  }

  const normalizedName = parsed.data.fullName.trim();
  if (normalizedName.length === 1) {
    return { success: false, error: "Full name must be at least 2 characters or left empty." };
  }

  const customer = await requireCustomer();
  try {
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        fullName: normalizedName.length > 0 ? normalizedName : null,
      },
    });

    revalidatePath("/account/profile");
    revalidatePath("/account/orders");
    revalidatePath("/", "layout");

    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    console.error("Failed to update customer profile", { customerId: customer.id, error });
    return { success: false, error: "Could not update profile right now. Please try again." };
  }
}

export async function changeCustomerPassword(input: z.infer<typeof ChangePasswordSchema>) {
  const parsed = ChangePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid password details." };
  }

  const customer = await requireCustomer();
  try {
    const dbCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
      select: { passwordHash: true },
    });

    if (!dbCustomer) {
      return { success: false, error: "Customer account not found." };
    }

    const currentMatches = await bcrypt.compare(parsed.data.currentPassword, dbCustomer.passwordHash);
    if (!currentMatches) {
      return { success: false, error: "Current password is incorrect." };
    }

    const isSamePassword = await bcrypt.compare(parsed.data.newPassword, dbCustomer.passwordHash);
    if (isSamePassword) {
      return { success: false, error: "New password must be different from current password." };
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash },
    });

    revalidatePath("/account/profile");

    return { success: true, message: "Password changed successfully." };
  } catch (error) {
    console.error("Failed to change customer password", { customerId: customer.id, error });
    return { success: false, error: "Could not change password right now. Please try again." };
  }
}
