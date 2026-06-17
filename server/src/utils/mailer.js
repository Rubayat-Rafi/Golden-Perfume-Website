import nodemailer from 'nodemailer';

// SMTP config comes from env. If it isn't set, emails are silently skipped so
// the app keeps working — just plug in the credentials when your provider is ready.
//
//   SMTP_HOST=smtp.yourprovider.com
//   SMTP_PORT=587
//   SMTP_SECURE=false            # true for port 465
//   SMTP_USER=apikey-or-username
//   SMTP_PASS=your-password
//   MAIL_FROM="Golden Perfume <no-reply@goldenfragrances.com>"
//   ADMIN_EMAIL=orders@goldenfragrances.com   # where store notifications go

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, MAIL_FROM } = process.env;

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || SMTP_USER || '';

let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  });
  console.log('[mailer] SMTP configured — email notifications enabled.');
} else {
  console.warn('[mailer] SMTP not configured — email notifications are disabled. Set SMTP_HOST, SMTP_USER, SMTP_PASS to enable.');
}

export const isMailEnabled = () => !!transporter;

/**
 * Send an email. Never throws — failures are logged so they can't break a request.
 * No-ops when SMTP isn't configured.
 */
export const sendMail = async ({ to, subject, html, replyTo }) => {
  if (!transporter || !to) return false;
  try {
    await transporter.sendMail({
      from: MAIL_FROM || `Golden Perfume <${SMTP_USER}>`,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    return true;
  } catch (err) {
    console.error('[mailer] send failed:', err.message);
    return false;
  }
};

/**
 * Fire-and-forget helper — sends without blocking the request/response cycle.
 */
export const sendMailAsync = (opts) => {
  Promise.resolve().then(() => sendMail(opts)).catch(() => {});
};
