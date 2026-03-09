export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex-1 max-w-3xl">
      <h1 className="mb-8 text-4xl font-extrabold text-[var(--foreground)]">Terms of Service</h1>
      <p className="text-sm text-secondary mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-8 text-secondary">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">1. Acceptance of Terms</h2>
          <p>By accessing or using Fisco Gadgets, you agree to be bound by these terms. If you disagree, you may not access our store and services.</p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">2. Product Descriptions</h2>
          <p>We strive to be as accurate as possible in pricing and product descriptions. However, we do not warrant that product descriptions or other content are error-free. Errors in pricing will be corrected before payment capture.</p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">3. Fraud Prevention</h2>
          <p>Fisco Gadgets reserves the right to cancel orders flagged as high risk by our payment partners. In such cases, full refunds are issued to the source account.</p>
        </section>
        
        <section>
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">4. Limitation of Liability</h2>
          <p>We are not liable for indirect or consequential losses arising out of your use of our products. Our maximum liability shall not exceed the purchase price of the physical item.</p>
        </section>
      </div>
    </div>
  );
}
