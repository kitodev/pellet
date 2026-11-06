"use client";
import { useState, type FormEvent } from "react";
import { EyeOff, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button, Field, Section, StatusMessage } from "@/components/ui";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { deleteSlide, saveSlide } from "@/lib/actions/slides";
import { ALLOWED_IMAGE_TYPES } from "@/lib/validations/product";
import type { Slide } from "@/types";

const PAGES: Record<Slide["page"], string> = {
  home: "Kezdőlap (a nagy kép helyén)",
  termekek: "Termékek oldal (a kategóriák fölött)",
};
const empty: Slide = {
  id: "",
  page: "home",
  title: "",
  subtitle: "",
  button_label: "",
  link_url: "",
  image_path: "",
  published: true,
  sort_order: 0,
};
const preview = (name: string) => `/uploads/slides/${encodeURIComponent(name)}`;

/** Slide-ok: the image carousel of the home page and the Termékek page. */
export function SlidesPanel({ slides }: { slides: Slide[] }) {
  const [editing, setEditing] = useState<Slide | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const { busy, status, run } = useAsyncAction();

  function open(s: Slide) {
    setEditing(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    if (editing.id) form.set("id", editing.id);
    form.set("image_path", editing.image_path);
    form.set("published", editing.published ? "true" : "false");
    const ok = await run(async () => {
      const r = await saveSlide(form);
      if (!r.success) throw new Error(r.message);
    });
    if (ok) setEditing(null);
  }

  return (
    <>
      <StatusMessage>{status}</StatusMessage>
      <div className="admin-toolbar">
        <h2>Slide-ok (képváltó)</h2>
        <Button onClick={() => open({ ...empty })}>
          <Plus size={16} /> Új slide
        </Button>
      </div>
      <p className="hint-box">
        A slide-ok 6 másodpercenként váltják egymást. A kezdőlapon, ha van legalább egy látható
        slide, az a nagy nyitókép helyére kerül; ha nincs, a régi nyitókép látszik. Ajánlott
        képméret: 1920 × 800 px (fekvő). A cím, a szöveg és a gomb elhagyható.
      </p>
      {editing && (
        <form className="admin-form admin-editor" onSubmit={submit} encType="multipart/form-data">
          <div className="admin-toolbar">
            <h3>{editing.id ? "Slide szerkesztése" : "Új slide"}</h3>
            <Button variant="ghost" icon aria-label="Bezárás" onClick={() => setEditing(null)}>
              <X size={18} />
            </Button>
          </div>
          <Section title="Slide">
            <Field label="Hol jelenjen meg?">
              <select
                name="page"
                value={editing.page}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    page: e.target.value === "termekek" ? "termekek" : "home",
                  })
                }
              >
                {Object.entries(PAGES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sorrend" hint="Kisebb szám = előrébb">
              <input
                name="sort_order"
                type="number"
                value={editing.sort_order}
                onChange={(e) =>
                  setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field
              label={editing.image_path ? "Kép (csere)" : "Kép *"}
              hint="JPG, PNG vagy WebP, max. 5 MB."
              wide
            >
              {editing.image_path && (
                <span className="file-current">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview(editing.image_path)} alt="" width={160} height={67} />
                </span>
              )}
              <input
                type="file"
                name="image"
                required={!editing.image_path}
                accept={ALLOWED_IMAGE_TYPES.join(",")}
              />
            </Field>
            <Field label="Cím" wide>
              <input
                name="title"
                maxLength={160}
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </Field>
            <Field label="Szöveg" wide>
              <textarea
                name="subtitle"
                rows={2}
                maxLength={300}
                value={editing.subtitle}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              />
            </Field>
            <Field label="Gomb felirata" hint="pl. Megnézem, Árajánlatot kérek">
              <input
                name="button_label"
                maxLength={60}
                value={editing.button_label}
                onChange={(e) => setEditing({ ...editing, button_label: e.target.value })}
              />
            </Field>
            <Field label="Gomb linkje" hint="pl. /termekek, /futoanyagok/fa-pellet, /arajanlat">
              <input
                name="link_url"
                maxLength={300}
                value={editing.link_url}
                onChange={(e) => setEditing({ ...editing, link_url: e.target.value })}
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
              <Save size={16} /> {busy ? "Mentés…" : "Slide mentése"}
            </Button>
          </div>
        </form>
      )}
      {!slides.length && <p className="muted">Még nincs slide.</p>}
      <div className="admin-list">
        {slides.map((s) => (
          <article key={s.id}>
            <div className="slide-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview(s.image_path)} alt="" width={120} height={50} />
              <div>
                <strong>{s.title || "(cím nélkül)"}</strong>
                <small>
                  {PAGES[s.page]} · {s.sort_order}. hely{" "}
                  {!s.published && (
                    <>
                      <EyeOff size={11} /> rejtett
                    </>
                  )}
                </small>
                {s.subtitle && <p>{s.subtitle}</p>}
              </div>
            </div>
            <div className="row">
              <Button
                variant="outline"
                icon
                aria-label="Slide szerkesztése"
                onClick={() => open(s)}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="outline"
                icon
                aria-label="Slide törlése"
                onClick={() => setConfirming(s.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
            {confirming === s.id && (
              <div className="admin-confirm">
                <p>Törli ezt a slide-ot?</p>
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() => {
                    setConfirming(null);
                    void run(async () => {
                      const x = await deleteSlide({ id: s.id });
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
