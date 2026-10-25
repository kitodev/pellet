"use client";
import { useState, type FormEvent } from "react";
import { EyeOff, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button, Field, Section, StatusMessage } from "@/components/ui";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { deleteReview, saveReview } from "@/lib/actions/reviews";
import type { ReviewInput } from "@/lib/validations/review";
import type { Review } from "@/types";

const empty: ReviewInput = {
  author: "",
  location: "",
  rating: 5,
  body: "",
  source: "Google",
  review_date: "",
  published: true,
  sort_order: 0,
};

export function ReviewsPanel({ reviews }: { reviews: Review[] }) {
  const [editing, setEditing] = useState<ReviewInput | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const { busy, status, run } = useAsyncAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const ok = await run(async () => {
      const r = await saveReview(editing);
      if (!r.success) throw new Error(r.message);
    });
    if (ok) setEditing(null);
  }

  return (
    <>
      <StatusMessage>{status}</StatusMessage>
      <div className="admin-toolbar">
        <h2>Vásárlói vélemények</h2>
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus size={16} /> Új vélemény
        </Button>
      </div>
      <p className="hint-box">
        Csak valódi vásárlói véleményt vigyen fel (pl. Google- vagy Facebook-értékelésből), a
        vásárló hozzájárulásával. A kezdőlapon a látható vélemények közül az első 6 jelenik meg; ha
        nincs egy sem, a blokk rejtve marad.
      </p>
      {editing && (
        <form className="admin-form admin-editor" onSubmit={submit}>
          <div className="admin-toolbar">
            <h3>{editing.id ? "Vélemény szerkesztése" : "Új vélemény"}</h3>
            <Button variant="ghost" icon aria-label="Bezárás" onClick={() => setEditing(null)}>
              <X size={18} />
            </Button>
          </div>
          <Section title="Vélemény">
            <Field label="Vásárló neve *">
              <input
                required
                maxLength={120}
                value={editing.author}
                onChange={(e) => setEditing({ ...editing, author: e.target.value })}
              />
            </Field>
            <Field label="Település">
              <input
                maxLength={120}
                value={editing.location}
                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
              />
            </Field>
            <Field label="Értékelés">
              <select
                value={editing.rating}
                onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)} ({n})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Forrás" hint="pl. Google, Facebook, személyes">
              <input
                maxLength={80}
                value={editing.source}
                onChange={(e) => setEditing({ ...editing, source: e.target.value })}
              />
            </Field>
            <Field label="Dátum">
              <input
                type="date"
                value={editing.review_date}
                onChange={(e) => setEditing({ ...editing, review_date: e.target.value })}
              />
            </Field>
            <Field label="Sorrend">
              <input
                type="number"
                value={editing.sort_order}
                onChange={(e) =>
                  setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Vélemény szövege *" wide>
              <textarea
                required
                rows={4}
                maxLength={3000}
                value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              />
            </Field>
            <label className="check">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
              />{" "}
              Látható a weboldalon
            </label>
          </Section>
          <div className="row">
            <Button type="submit" disabled={busy}>
              <Save size={16} /> {busy ? "Mentés…" : "Vélemény mentése"}
            </Button>
          </div>
        </form>
      )}
      {!reviews.length && <p className="muted">Még nincs felvitt vélemény.</p>}
      <div className="admin-list">
        {reviews.map((r) => (
          <article key={r.id}>
            <div>
              <strong>{r.author}</strong>
              <small>
                {"★".repeat(r.rating)} ·{" "}
                {[r.location, r.source, r.review_date].filter(Boolean).join(" · ")}{" "}
                {!r.published && (
                  <>
                    <EyeOff size={11} /> rejtett
                  </>
                )}
              </small>
              <p>{r.body}</p>
            </div>
            <div className="row">
              <Button
                variant="outline"
                icon
                aria-label={`${r.author} véleményének szerkesztése`}
                onClick={() => setEditing({ ...r, review_date: r.review_date ?? "" })}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="outline"
                icon
                aria-label={`${r.author} véleményének törlése`}
                onClick={() => setConfirming(r.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
            {confirming === r.id && (
              <div className="admin-confirm">
                <p>Törli ezt a véleményt?</p>
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() => {
                    setConfirming(null);
                    void run(async () => {
                      const x = await deleteReview({ id: r.id });
                      if (!x.success) throw new Error(x.message);
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
