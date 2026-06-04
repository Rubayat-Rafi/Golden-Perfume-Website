const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-playfair font-normal text-[20px] md:text-[24px] text-dark-green mb-4">{title}</h2>
    <div className="font-lato text-[14px] md:text-[15px] text-dark-green/70 leading-relaxed space-y-3">
      {children}
    </div>
  </div>
);

const PrivacyPolicyPage = () => (
  <div className="bg-cream min-h-screen">
    {/* Hero */}
    <div className="bg-dark-green py-14 md:py-20 text-center">
      <span className="font-lato text-brand-green text-[11px] uppercase tracking-[4px] block mb-3">Legal</span>
      <h1 className="font-playfair font-normal text-[28px] md:text-[42px] text-white mb-4">Privacy Policy</h1>
      <p className="font-lato text-[13px] text-white/40">Last updated: June 1, 2026</p>
    </div>

    {/* Content */}
    <div className="max-w-3xl mx-auto px-4 md:px-10 py-14 md:py-20">

      <Section title="1. Introduction">
        <p>
          Golden Perfume ("we," "us," or "our"), located at 916 Canal Street, New Orleans, LA 70112, operates
          the website <strong className="text-dark-green">goldenperfume.com</strong>. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you visit our website or place an order with us,
          whether as a retail (B2C) or wholesale (B2B) customer.
        </p>
        <p>
          Please read this policy carefully. If you disagree with its terms, please discontinue use of the site.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p><strong className="text-dark-green">Personal Information you provide:</strong></p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Name, email address, and phone number when you create an account or contact us</li>
          <li>Billing and shipping address when you place an order</li>
          <li>Business name, EIN, and license number when applying for a wholesale account</li>
          <li>Payment information (processed securely by our payment provider — we never store card numbers)</li>
          <li>Messages and inquiries submitted through our contact form</li>
        </ul>
        <p className="mt-3"><strong className="text-dark-green">Information collected automatically:</strong></p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Log data including your IP address, browser type, pages visited, and time spent</li>
          <li>Cookies and similar tracking technologies (see Section 6)</li>
          <li>Device information including operating system and screen resolution</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Process and fulfill your orders, including shipping and returns</li>
          <li>Create and manage your account (retail or wholesale)</li>
          <li>Review and approve wholesale account applications</li>
          <li>Send transactional emails (order confirmations, shipping updates, account approvals)</li>
          <li>Send marketing communications if you have opted in — you may unsubscribe at any time</li>
          <li>Respond to customer service inquiries and contact form submissions</li>
          <li>Prevent fraud and maintain the security of our platform</li>
          <li>Comply with legal obligations</li>
        </ul>
      </Section>

      <Section title="4. Sharing Your Information">
        <p>We do not sell, trade, or rent your personal information to third parties. We may share your data with:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li><strong className="text-dark-green">Payment processors</strong> (e.g., Stripe) to handle transactions securely</li>
          <li><strong className="text-dark-green">Shipping carriers</strong> (e.g., USPS, UPS) to deliver your orders</li>
          <li><strong className="text-dark-green">Email service providers</strong> to send transactional and marketing emails</li>
          <li><strong className="text-dark-green">Legal authorities</strong> when required by law or to protect our rights</li>
        </ul>
        <p>All third-party service providers are required to maintain the confidentiality and security of your information.</p>
      </Section>

      <Section title="5. Data Retention">
        <p>
          We retain your personal information for as long as your account is active or as needed to provide services.
          Order records are retained for a minimum of 7 years for tax and legal compliance. You may request deletion
          of your account data at any time by contacting us at{' '}
          <a href="mailto:info@goldenfragrances.com" className="text-brand-green hover:text-dark-green underline">
            info@goldenfragrances.com
          </a>.
        </p>
      </Section>

      <Section title="6. Cookies">
        <p>
          We use cookies and similar technologies to enhance your experience on our site. These include:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li><strong className="text-dark-green">Essential cookies</strong> — required for authentication and cart functionality</li>
          <li><strong className="text-dark-green">Analytics cookies</strong> — help us understand how visitors use our site</li>
          <li><strong className="text-dark-green">Marketing cookies</strong> — used to deliver relevant advertisements</li>
        </ul>
        <p>You can control cookies through your browser settings. Disabling essential cookies may affect site functionality.</p>
      </Section>

      <Section title="7. Security">
        <p>
          We implement industry-standard security measures including SSL/TLS encryption, secure httpOnly cookies for
          authentication tokens, and bcrypt password hashing. However, no method of internet transmission is 100% secure,
          and we cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="8. Your Rights">
        <p>Depending on your location, you may have the right to:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your personal data</li>
          <li>Opt out of marketing communications at any time</li>
          <li>Lodge a complaint with your local data protection authority</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{' '}
          <a href="mailto:info@goldenfragrances.com" className="text-brand-green hover:text-dark-green underline">
            info@goldenfragrances.com
          </a>.
        </p>
      </Section>

      <Section title="9. Children's Privacy">
        <p>
          Our site is not directed to individuals under the age of 13. We do not knowingly collect personal information
          from children. If you believe we have inadvertently collected such information, please contact us immediately.
        </p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>
          We reserve the right to update this Privacy Policy at any time. We will notify you of significant changes by
          posting a prominent notice on our website and, where appropriate, sending an email notification. Your continued
          use of the site after changes are posted constitutes your acceptance of the revised policy.
        </p>
      </Section>

      <Section title="11. Contact Us">
        <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
        <div className="bg-white rounded-xl p-5 mt-4 space-y-1.5">
          <p><strong className="text-dark-green">Golden Perfume</strong></p>
          <p>916 Canal Street, New Orleans, LA 70112, USA</p>
          <p>
            Email:{' '}
            <a href="mailto:info@goldenfragrances.com" className="text-brand-green hover:text-dark-green underline">
              info@goldenfragrances.com
            </a>
          </p>
          <p>Phone: +1 (504) 529-2069</p>
        </div>
      </Section>

    </div>
  </div>
);

export default PrivacyPolicyPage;
