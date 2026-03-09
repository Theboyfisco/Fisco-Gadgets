export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex-1 max-w-3xl">
      <h1 className="mb-8 text-4xl font-extrabold text-[var(--foreground)]">Privacy Policy</h1>
      <p className="text-sm text-secondary mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-8 text-secondary">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">Information Collection</h2>
          <p>We collect personal data you provide directly to us when creating an account, making a purchase, subscribing to a newsletter, or communicating with us. This includes your name, shipping/billing address, email, and phone number.</p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">Payment Processing</h2>
          <p>We do not store complete credit card information on our servers. All sensitive financial data is encrypted and passed directly to secure payment gateways (like Paystack) in compliance with PCI-DSS.</p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">Data Usage</h2>
          <p>We only use your information for order fulfillment, improving user experience, and occasionally sending marketing updates if you have opted in.</p>
        </section>
      </div>
    </div>
  );
}
