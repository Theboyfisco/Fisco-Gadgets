import { redirect } from "next/navigation";
import { hasAdminUser } from "@/lib/admin-auth";
import { AdminSetupForm } from "@/components/admin/AdminSetupForm";

export default async function AdminSetupPage() {
  let exists = false;
  try {
    exists = await hasAdminUser();
  } catch (error) {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-20">
        <div className="w-full max-w-xl rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin setup unavailable</h1>
          <p className="mt-2 text-sm text-secondary">
            {error instanceof Error ? error.message : "Unable to reach the admin credentials store."}
          </p>
        </div>
      </div>
    );
  }
  if (exists) {
    redirect("/admin/login");
  }

  return <AdminSetupForm />;
}
