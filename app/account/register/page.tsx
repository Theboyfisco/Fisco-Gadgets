import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { CustomerRegisterForm } from "@/components/account/CustomerRegisterForm";

export default async function CustomerRegisterPage() {
  const customer = await getCurrentCustomer();
  if (customer) {
    redirect("/account/orders");
  }

  return <CustomerRegisterForm />;
}
