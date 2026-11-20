"use client";
import { useState } from "react";
import { CheckCircle2, Circle, ExternalLink, Mail, Phone, Trash2 } from "lucide-react";
import { Button, StatusMessage } from "@/components/ui";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { markQuote, removeQuote } from "@/lib/actions/quotes";
import type { QuoteRequest } from "@/types";

const INSTALL: Record<string, string> = {
  yes: "Telepítést is kér",
  no: "Telepítést nem kér",
  unsure: "Telepítés: még nem tudja",
};
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("hu-HU", { dateStyle: "medium", timeStyle: "short" });

/** Árajánlatkérések from the website (also e-mailed to the company address). */
export function QuotesPanel({ quotes }: { quotes: QuoteRequest[] }) {
  const { busy, status, run } = useAsyncAction();
  const [filter, setFilter] = useState<"new" | "all">("new");
  const [confirming, setConfirming] = useState<string | null>(null);
  const shown = quotes.filter((q) => filter === "all" || q.status === "new");
  return (
    <>
      <StatusMessage>{status}</StatusMessage>
      <div className="admin-toolbar">
        <h2>Árajánlatkérések</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value as "new" | "all")}>
          <option value="new">Csak a nyitottak</option>
          <option value="all">Mind</option>
        </select>
      </div>
      <p className="hint-box">
        A weboldal minden ajánlatkérést elküld e-mailben is (pelletcentrumkft@gmail.com), és itt is
        megőrzi. A „levél nem ment ki” jelölésnél az e-mail-küldés nincs beállítva vagy hibás –
        ilyenkor innen válaszoljon. Az adatokat a lezárás után legfeljebb 2 évig tartsa meg
        (adatkezelési tájékoztató).
      </p>
      {!shown.length && (
        <p className="muted">Nincs {filter === "new" ? "nyitott " : ""}ajánlatkérés.</p>
      )}
      <div className="admin-list">
        {shown.map((q) => (
          <article key={q.id} className={q.status === "done" ? "quote-done" : ""}>
            <div>
              <strong>{q.product_name}</strong>
              <small>
                {fmt(q.created_at)} ·{" "}
                {[q.quantity, q.unit].filter(Boolean).join(" ") || "mennyiség nincs megadva"} ·{" "}
                {q.delivery === "delivery"
                  ? `Kiszállítás: ${q.zip} ${q.city}`
                  : "Telephelyi átvétel"}
                {q.installation && INSTALL[q.installation] ? ` · ${INSTALL[q.installation]}` : ""}
                {!q.mail_sent && " · ⚠ levél nem ment ki"}
              </small>
              <p>
                {q.name}
                {q.company ? ` (${q.company})` : ""} ·{" "}
                <a
                  href={`mailto:${q.email}?subject=${encodeURIComponent(`Árajánlat: ${q.product_name}`)}`}
                >
                  <Mail size={12} /> {q.email}
                </a>
                {q.phone && (
                  <>
                    {" · "}
                    <a href={`tel:${q.phone.replace(/[^\d+]/g, "")}`}>
                      <Phone size={12} /> {q.phone}
                    </a>
                  </>
                )}
                {q.product_url && (
                  <>
                    {" · "}
                    <a href={q.product_url} target="_blank" rel="noopener">
                      <ExternalLink size={12} /> termékoldal
                    </a>
                  </>
                )}
              </p>
              {q.message && <p className="whitespace-pre-line">{q.message}</p>}
            </div>
            <div className="row">
              <Button
                variant="outline"
                icon
                disabled={busy}
                aria-label={q.status === "done" ? "Újranyitás" : "Lezárás (kész)"}
                title={q.status === "done" ? "Újranyitás" : "Lezárás (kész)"}
                onClick={() =>
                  void run(async () => {
                    const r = await markQuote({ id: q.id, done: q.status !== "done" });
                    if (!r.success) throw new Error(r.message);
                  }, "Mentve.")
                }
              >
                {q.status === "done" ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </Button>
              <Button
                variant="outline"
                icon
                aria-label="Törlés"
                onClick={() => setConfirming(q.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
            {confirming === q.id && (
              <div className="admin-confirm">
                <p>Törli ezt az ajánlatkérést?</p>
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() => {
                    setConfirming(null);
                    void run(async () => {
                      const r = await removeQuote({ id: q.id });
                      if (!r.success) throw new Error(r.message);
                    }, "Törölve.");
                  }}
                >
                  Törlés
                </Button>
                <Button variant="outline" onClick={() => setConfirming(null)}>
                  Mégse
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
