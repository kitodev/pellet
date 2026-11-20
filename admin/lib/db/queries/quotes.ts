import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db/client";
import type { QuoteRequest } from "@/types";

/** Árajánlatkérések from the website, newest first (table from migration 007). */
export async function listQuoteRequests(limit = 300): Promise<QuoteRequest[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT ?",
    [limit],
  );
  return rows.map((r) => ({
    id: r.id,
    created_at: new Date(r.created_at).toISOString(),
    product_name: r.product_name ?? "",
    product_url: r.product_url ?? "",
    quantity: r.quantity ?? "",
    unit: r.unit ?? "",
    delivery: r.delivery ?? "",
    zip: r.zip ?? "",
    city: r.city ?? "",
    installation: r.installation ?? "",
    name: r.name,
    company: r.company ?? "",
    email: r.email,
    phone: r.phone ?? "",
    message: r.message ?? "",
    mail_sent: Number(r.mail_sent) === 1,
    status: r.status === "done" ? "done" : "new",
  }));
}

export async function setQuoteStatus(id: string, status: "new" | "done") {
  await db.query("UPDATE quote_requests SET status = ? WHERE id = ?", [status, id]);
}

export async function deleteQuoteRequest(id: string) {
  await db.query("DELETE FROM quote_requests WHERE id = ?", [id]);
}
