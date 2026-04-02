import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { CustomerLoginForm } from "@/components/account/CustomerLoginForm";

export default async function CustomerLoginPage() {
  const customer = await getCurrentCustomer();
  if (customer) {
    redirect("/account/orders");
  }

  return <CustomerLoginForm />;
}
