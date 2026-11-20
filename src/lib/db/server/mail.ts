import nodemailer from "nodemailer";

/**
 * E-mail sending (SMTP) – settings in .env:
 *   SMTP_HOST=smtp.gmail.com  SMTP_PORT=465  SMTP_USER=pelletcentrumkft@gmail.com
 *   SMTP_PASS=<Gmail app password>  MAIL_FROM (optional)  QUOTE_TO (default pelletcentrumkft@gmail.com)
 */
export function mailConfig() {
  const host = process.env["SMTP_HOST"] ?? "";
  const user = process.env["SMTP_USER"] ?? "";
  const pass = process.env["SMTP_PASS"] ?? "";
  const port = Number(process.env["SMTP_PORT"] || 465);
  return {
    configured: Boolean(host && user && pass),
    host,
    port,
    user,
    pass,
    from: process.env["MAIL_FROM"] || (user ? `Pellet Centrum Kft. <${user}>` : ""),
    to: process.env["QUOTE_TO"] || "pelletcentrumkft@gmail.com",
  };
}

let transport: nodemailer.Transporter | null = null;
function transporter() {
  const c = mailConfig();
  transport ??= nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.port === 465,
    auth: { user: c.user, pass: c.pass },
  });
  return transport;
}

export async function sendMail(mail: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}) {
  const c = mailConfig();
  if (!c.configured) throw new Error("SMTP is not configured");
  await transporter().sendMail({ from: c.from, ...mail });
}

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
