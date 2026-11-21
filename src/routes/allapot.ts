import { createFileRoute } from "@tanstack/react-router";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db/server/client";

// /allapot – quick health check: is the database reachable, how many products are there?
// Shows no secrets (only the database host and the error code).
export const Route = createFileRoute("/allapot")({
  server: {
    handlers: {
      GET: async () => {
        let host = "";
        try {
          host = new URL(process.env["DATABASE_URL"] ?? "").hostname;
        } catch {
          host = process.env["DATABASE_URL"] ? "(hibás DATABASE_URL)" : "(nincs DATABASE_URL)";
        }
        const result: Record<string, unknown> = { adatbazis_host: host || "(nincs megadva)" };
        try {
          const [rows] = await db().query<RowDataPacket[]>(
            "SELECT COUNT(*) AS osszes, SUM(published = 1) AS lathato FROM products",
          );
          result["kapcsolat"] = "rendben";
          result["termekek"] = Number(rows[0]?.["osszes"] ?? 0);
          result["lathato_termekek"] = Number(rows[0]?.["lathato"] ?? 0);
        } catch (error) {
          const e = error as { code?: string; message?: string };
          result["kapcsolat"] = "HIBA";
          result["hibakod"] = e.code ?? "";
          result["hiba"] = (e.message ?? "").replace(/'[^']*'@'[^']*'/g, "'***'").slice(0, 200);
        }
        result["email_kuldes"] = process.env["SMTP_PASS"] ? "beállítva" : "nincs beállítva";
        return new Response(JSON.stringify(result, null, 2), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
