import { NextResponse } from "next/server";
import { clearCustomerSession } from "@/lib/customer-auth";

export async function GET(request: Request) {
  await clearCustomerSession();
  return NextResponse.redirect(new URL("/account/login", request.url));
}
