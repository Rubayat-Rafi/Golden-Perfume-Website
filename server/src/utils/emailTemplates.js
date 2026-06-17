// Email HTML templates — inline-styled for broad email-client support.
// Brand: deep green #16361F / brand green #217945 / gold #C2A038.

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const layout = (heading, bodyHtml) => `
  <div style="margin:0;padding:24px;background:#f4f5f4;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e8;">
      <div style="background:#16361F;padding:22px 28px;">
        <span style="color:#C2A038;font-size:13px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">Golden Perfume</span>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#16361F;font-weight:normal;">${heading}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:18px 28px;background:#fafafa;border-top:1px solid #eee;">
        <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
          Golden Perfume · 916 Canal Street, New Orleans LA 70112, USA<br/>
          +1 (504) 529-2069 · info@goldenfragrances.com
        </p>
      </div>
    </div>
  </div>
`;

const itemsTable = (items) => `
  <table style="width:100%;border-collapse:collapse;margin:8px 0 16px;">
    <thead>
      <tr>
        <th align="left"  style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#aaa;padding:6px 0;border-bottom:1px solid #eee;">Item</th>
        <th align="center" style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#aaa;padding:6px 0;border-bottom:1px solid #eee;">Qty</th>
        <th align="right" style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#aaa;padding:6px 0;border-bottom:1px solid #eee;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((it) => `
        <tr>
          <td style="font-size:13px;color:#333;padding:8px 0;border-bottom:1px solid #f3f3f3;">
            ${it.name}${it.size ? ` <span style="color:#999;">· ${it.size}</span>` : ''}
          </td>
          <td align="center" style="font-size:13px;color:#666;padding:8px 0;border-bottom:1px solid #f3f3f3;">${it.qty}</td>
          <td align="right" style="font-size:13px;color:#16361F;font-weight:bold;padding:8px 0;border-bottom:1px solid #f3f3f3;">${money(it.total)}</td>
        </tr>`).join('')}
    </tbody>
  </table>
`;

const totalsBlock = (order) => `
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="font-size:13px;color:#666;padding:3px 0;">Subtotal</td><td align="right" style="font-size:13px;color:#666;">${money(order.subtotal)}</td></tr>
    ${order.discount > 0 ? `<tr><td style="font-size:13px;color:#666;padding:3px 0;">Discount</td><td align="right" style="font-size:13px;color:#666;">−${money(order.discount)}</td></tr>` : ''}
    <tr><td style="font-size:13px;color:#666;padding:3px 0;">Shipping</td><td align="right" style="font-size:13px;color:#666;">${money(order.shippingCost)}</td></tr>
    ${order.tax > 0 ? `<tr><td style="font-size:13px;color:#666;padding:3px 0;">Tax</td><td align="right" style="font-size:13px;color:#666;">${money(order.tax)}</td></tr>` : ''}
    <tr><td style="font-size:15px;color:#16361F;font-weight:bold;padding:8px 0 0;">Total</td><td align="right" style="font-size:15px;color:#16361F;font-weight:bold;padding:8px 0 0;">${money(order.grandTotal)}</td></tr>
  </table>
`;

const addressBlock = (a) => !a?.street ? '' : `
  <p style="margin:14px 0 0;font-size:13px;color:#666;line-height:1.6;">
    <strong style="color:#16361F;">Ship to</strong><br/>
    ${a.street}<br/>${a.city || ''}${a.state ? `, ${a.state}` : ''} ${a.zip || ''}<br/>${a.country || ''}
  </p>
`;

// ── Order: confirmation to the customer ──────────────────────────────────────
export const orderConfirmationEmail = ({ order, items, customerName }) => ({
  subject: `Order ${order.orderNumber} confirmed — Golden Perfume`,
  html: layout('Thank you for your order!', `
    <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 16px;">
      Hi ${customerName || 'there'}, we've received your order <strong>${order.orderNumber}</strong> and it's now being processed.
      You'll get another email when it ships.
    </p>
    ${itemsTable(items)}
    ${totalsBlock(order)}
    ${addressBlock(order.shippingAddress)}
  `),
});

// ── Order: notification to the store admin ──────────────────────────────────
export const newOrderAdminEmail = ({ order, items, customerName, customerEmail }) => ({
  subject: `New order ${order.orderNumber} (${money(order.grandTotal)})`,
  html: layout('New order received', `
    <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 16px;">
      <strong>${customerName || 'A customer'}</strong> (${customerEmail || '—'}) just placed order
      <strong>${order.orderNumber}</strong> · <span style="text-transform:uppercase;">${order.customerType}</span>.
    </p>
    ${itemsTable(items)}
    ${totalsBlock(order)}
    ${addressBlock(order.shippingAddress)}
  `),
});

// ── Wholesale: acknowledgement to the applicant ─────────────────────────────
export const wholesaleReceivedEmail = ({ contactName, businessName }) => ({
  subject: 'We received your wholesale application — Golden Perfume',
  html: layout('Application received', `
    <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 14px;">
      Hi ${contactName || 'there'}, thank you for applying for a wholesale account for
      <strong>${businessName}</strong>.
    </p>
    <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">
      Our team will review your application within <strong>2 business days</strong> and email you the decision.
      Once approved, you'll see wholesale pricing as soon as you sign in.
    </p>
  `),
});

// ── Wholesale: notification to the store admin ──────────────────────────────
export const newWholesaleAdminEmail = ({ application }) => ({
  subject: `New wholesale application — ${application.businessName}`,
  html: layout('New wholesale application', `
    <table style="width:100%;border-collapse:collapse;font-size:13px;color:#555;">
      <tr><td style="padding:5px 0;color:#999;width:140px;">Business</td><td style="color:#16361F;font-weight:bold;">${application.businessName}</td></tr>
      <tr><td style="padding:5px 0;color:#999;">Type</td><td>${application.businessType || '—'}</td></tr>
      <tr><td style="padding:5px 0;color:#999;">Contact</td><td>${application.contactName}</td></tr>
      <tr><td style="padding:5px 0;color:#999;">Email</td><td>${application.email}</td></tr>
      <tr><td style="padding:5px 0;color:#999;">Phone</td><td>${application.phone || '—'}</td></tr>
      <tr><td style="padding:5px 0;color:#999;">Volume</td><td>${application.monthlyOrderRange || '—'}</td></tr>
    </table>
    <p style="font-size:13px;color:#888;margin:16px 0 0;">Review it in the admin panel under Wholesale.</p>
  `),
});

// ── Wholesale: decision notice to the applicant (approved / rejected) ────────
export const wholesaleDecisionEmail = ({ contactName, businessName, status, adminNote }) => {
  const approved = status === 'approved';
  return {
    subject: approved
      ? 'Your wholesale account is approved — Golden Perfume'
      : 'Update on your wholesale application — Golden Perfume',
    html: layout(approved ? 'You\'re approved!' : 'Application update', `
      <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 14px;">
        Hi ${contactName || 'there'},
      </p>
      <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 14px;">
        ${approved
          ? `Your wholesale account for <strong>${businessName}</strong> has been <strong style="color:#217945;">approved</strong>. Sign in to start ordering at wholesale prices.`
          : `After reviewing your application for <strong>${businessName}</strong>, we're unable to approve a wholesale account at this time.`}
      </p>
      ${adminNote ? `<p style="font-size:13px;color:#666;background:#f7f7f7;border-radius:8px;padding:12px 14px;margin:0;"><strong>Note:</strong> ${adminNote}</p>` : ''}
    `),
  };
};
