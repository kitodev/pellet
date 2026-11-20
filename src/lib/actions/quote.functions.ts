import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { quoteSchema, DELIVERY_LABEL, INSTALLATION_LABEL } from "@/lib/validations/quote";
import {
  getProduct,
  insertQuoteRequest,
  listTexts,
  markQuoteMailed,
} from "@/lib/db/server/queries";
import { escapeHtml, mailConfig, sendMail } from "@/lib/db/server/mail";
import { productPath } from "@/lib/utils/urls";

// Simple flood protection: max. 5 requests / 10 minutes / IP (per server instance).
const recent = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const list = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  recent.set(ip, list);
  return list.length > 5;
}

/**
 * Árajánlatkérés: validates the form, identifies the product, stores the request (quote_requests),
 * e-mails it to the company (QUOTE_TO, default pelletcentrumkft@gmail.com) and sends the customer
 * an automatic confirmation.
 */
export const sendQuote = createServerFn({ method: "POST" })
  .inputValidator((input) => quoteSchema.parse(input))
  .handler(async ({ data: q }) => {
    if (q.website) return { ok: true, mailed: true }; // honeypot: pretend success for bots
    if (Date.now() - q.started_at < 2500)
      throw new Error("Kérjük, ellenőrizze az adatokat, majd küldje el újra.");
    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (tooMany(ip))
      throw new Error("Túl sok kérés érkezett. Kérjük, próbálja újra néhány perc múlva.");

    // Identify the product from the database (not trusting the name sent by the browser).
    const product = q.product_id ? await getProduct(q.product_id).catch(() => null) : null;
    const site = (process.env["SITE_URL"] ?? "").replace(/\/+$/, "");
    const productUrl = product?.published ? `${site}${productPath(product)}` : (q.page_url ?? "");
    const subject = product?.published
      ? `${product.name}${product.brand ? ` (${product.brand})` : ""}`
      : q.subject;

    const record = {
      product_id: product?.published ? product.id : null,
      product_name: subject,
      product_url: productUrl,
      quantity: q.quantity,
      unit: q.unit,
      delivery: q.delivery,
      zip: q.delivery === "delivery" ? q.zip : "",
      city: q.delivery === "delivery" ? q.city : "",
      installation: q.installation,
      name: q.name,
      company: q.company,
      email: q.email,
      phone: q.phone,
      message: q.message,
    };
    let id: string | null = null;
    try {
      id = await insertQuoteRequest(record);
    } catch (error) {
      console.error("[pellet] Ajánlatkérés mentése sikertelen (pnpm db:migrate?):", error);
    }

    const amount = [q.quantity, q.unit].filter(Boolean).join(" ") || "–";
    const rows: [string, string][] = [
      ["Termék / téma", subject],
      ...(productUrl ? ([["Termékoldal", productUrl]] as [string, string][]) : []),
      ["Mennyiség", amount],
      [
        "Átvétel",
        q.delivery === "delivery"
          ? `${DELIVERY_LABEL.delivery}: ${q.zip} ${q.city}`
          : DELIVERY_LABEL.pickup,
      ],
      ...(q.installation
        ? ([["Telepítés / beüzemelés", INSTALLATION_LABEL[q.installation]]] as [string, string][])
        : []),
      ["Név", q.name],
      ...(q.company ? ([["Cégnév", q.company]] as [string, string][]) : []),
      ["E-mail", q.email],
      ["Telefon", q.phone || "–"],
      ["Megjegyzés", q.message || "–"],
    ];
    const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
    const table = `<table cellpadding="6" style="border-collapse:collapse;font:14px Arial,sans-serif">${rows
      .map(
        ([k, v]) =>
          `<tr><th align="left" style="background:#f1f3ec;border:1px solid #dfe3d6">${escapeHtml(k)}</th><td style="border:1px solid #dfe3d6;white-space:pre-line">${escapeHtml(v)}</td></tr>`,
      )
      .join("")}</table>`;

    const config = mailConfig();
    let mailed = false;
    if (config.configured) {
      try {
        await sendMail({
          to: config.to,
          replyTo: q.email,
          subject: `Árajánlatkérés: ${subject} – ${amount}`,
          text: `Új árajánlatkérés érkezett a weboldalról.\n\n${text}`,
          html: `<p style="font:14px Arial,sans-serif">Új árajánlatkérés érkezett a weboldalról.</p>${table}`,
        });
        mailed = true;
        if (id) await markQuoteMailed(id).catch(() => undefined);
      } catch (error) {
        console.error("[pellet] Ajánlatkérés e-mail küldése sikertelen:", error);
      }
      // Automatic confirmation to the customer.
      if (mailed) {
        const texts = await listTexts().catch(() => []);
        const t = (k: string) => texts.find((x) => x.key === k)?.value ?? "";
        const phone = t("contact.phone");
        const intro =
          "Köszönjük árajánlatkérését! Megkaptuk, kollégánk hamarosan felveszi Önnel a kapcsolatot.";
        await sendMail({
          to: q.email,
          replyTo: config.to,
          subject: `Ajánlatkérését megkaptuk – ${subject}`,
          text: `Kedves ${q.name}!\n\n${intro}\n\nAz Ön által megadott adatok:\n${text}\n\nÜdvözlettel:\nPellet Centrum Kft.\n${config.to}${phone ? `\n${phone}` : ""}`,
          html: `<p style="font:14px Arial,sans-serif">Kedves ${escapeHtml(q.name)}!</p><p style="font:14px Arial,sans-serif">${intro}</p><p style="font:14px Arial,sans-serif">Az Ön által megadott adatok:</p>${table}<p style="font:14px Arial,sans-serif">Üdvözlettel:<br>Pellet Centrum Kft.<br>${escapeHtml(config.to)}${phone ? `<br>${escapeHtml(phone)}` : ""}</p>`,
        }).catch((error: unknown) =>
          console.error("[pellet] Visszaigazoló e-mail küldése sikertelen:", error),
        );
      }
    }
    if (!mailed && !id)
      throw new Error(
        "Az ajánlatkérést most nem sikerült elküldeni. Kérjük, írjon nekünk e-mailben: pelletcentrumkft@gmail.com",
      );
    return { ok: true, mailed };
  });
