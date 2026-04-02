"use server";

import { hasAdminUser, createAdminUser, authenticateAdmin, createAdminSession, clearAdminSession } from "@/lib/admin-auth";

export async function setupAdmin(username: string, password: string) {
  try {
    const exists = await hasAdminUser();
    if (exists) {
      return { success: false, error: "Admin already exists." };
    }

    if (!username || username.trim().length < 3) {
      return { success: false, error: "Username must be at least 3 characters." };
    }
    if (!password || password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters." };
    }

    const user = await createAdminUser(username.trim(), password);
    await createAdminSession(user.username);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Setup failed." };
  }
}

export async function loginAdmin(username: string, password: string) {
  try {
    const user = await authenticateAdmin(username.trim(), password);
    if (!user) {
      return { success: false, error: "Invalid credentials." };
    }

    await createAdminSession(user.username);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Login failed." };
  }
}

export async function logoutAdmin() {
  await clearAdminSession();
  return { success: true };
}
