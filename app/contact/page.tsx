import { ContactPageClient } from "@/components/contact/ContactPageClient";

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ product?: string; order?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const initialMessage = params?.order
    ? `I need support for order reference ${params.order}.`
    : params?.product
      ? `I need more information about product: ${params.product}.`
      : "";

  return <ContactPageClient initialMessage={initialMessage} />;
}
