"use client";
import { useState, type FormEvent } from "react";
import { FileText, Save, Trash2, X } from "lucide-react";
import { Button, Field, Section } from "@/components/ui";
import { areas, areaKeys, groupedCategories, type AreaKey } from "@/lib/content/menu";
import { slugify } from "@/lib/utils/slug";
import { ALLOWED_IMAGE_TYPES, MAX_GALLERY } from "@/lib/validations/product";
import type { Product } from "@/types";

export type ProductDraft = Omit<Product, "created_at" | "images"> & { images: string[] };

export const emptyProduct = (area: AreaKey = "futoanyagok"): ProductDraft => ({
  id: "", slug: "", area, category: areas[area].categories[0]!.slug, name: "", short_description: "", description: "",
  price: null, sale_price: null, price_unit: "", specs: {}, image_path: "", images: [], datasheet_path: "", featured: false, published: true, sort_order: 0,
});

const preview = (folder: string, name: string) => `/uploads/${folder}/${encodeURIComponent(name)}`;
const UNITS = ["Ft/zsák", "Ft/raklap", "Ft/kg", "Ft/tonna", "Ft/db", "Ft/m³", "Ft/csomag"];

type Props = { initial: ProductDraft; busy: boolean; onCancel: () => void; onSubmit: (form: FormData) => void };

export function ProductForm({ initial, busy, onCancel, onSubmit }: Props) {
  const [p, setP] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [removeImages, setRemoveImages] = useState<string[]>([]);
  const [removeMain, setRemoveMain] = useState(false);
  const [removeSheet, setRemoveSheet] = useState(false);
  const area = areas[p.area as AreaKey] ?? areas.futoanyagok;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (p.id) form.set("id", p.id);
    form.set("image_path", removeMain ? "" : p.image_path);
    form.set("datasheet_path", removeSheet ? "" : p.datasheet_path);
    for (const r of removeImages) form.append("remove_images", r);
    onSubmit(form);
  }

  const toggle = (name: string) => setRemoveImages((list) => (list.includes(name) ? list.filter((x) => x !== name) : [...list, name]));

  return (
    <form className="admin-form admin-editor" onSubmit={submit} encType="multipart/form-data">
      <div className="admin-toolbar">
        <h3>{p.id ? "Termék szerkesztése" : "Új termék"}</h3>
        <Button variant="ghost" icon aria-label="Szerkesztés bezárása" onClick={onCancel}><X size={18} /></Button>
      </div>

      <Section title="Alapadatok">
        <Field label="Menüpont">
          <select name="area" value={p.area} onChange={(e) => { const a = e.target.value as AreaKey; setP({ ...p, area: a, category: areas[a].categories[0]!.slug }); }}>
            {areaKeys.map((k) => <option key={k} value={k}>{areas[k].label}</option>)}
          </select>
        </Field>
        <Field label="Kategória (almenü)">
          <select name="category" value={p.category} onChange={(e) => setP({ ...p, category: e.target.value })}>
            {groupedCategories(area).map((g) => g.group
              ? <optgroup key={g.group} label={g.group}>{g.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</optgroup>
              : g.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>))}
          </select>
        </Field>
        <Field label="Terméknév *" wide>
          <input name="name" required maxLength={200} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} />
        </Field>
        <Field label="URL (webcím)" hint={`/${p.area}/${p.category}/${p.slug || "…"}`} wide>
          <input name="slug" maxLength={120} pattern="[a-z0-9-]*" value={p.slug} onChange={(e) => { setSlugTouched(true); setP({ ...p, slug: slugify(e.target.value).slice(0, 120) || "" }); }} />
        </Field>
        <Field label="Rövid leírás" hint="A termékkártyán és a Google-találatban jelenik meg (max. 300 karakter)." wide>
          <textarea name="short_description" rows={2} maxLength={300} value={p.short_description} onChange={(e) => setP({ ...p, short_description: e.target.value })} />
        </Field>
        <Field label="Részletes leírás" wide>
          <textarea name="description" rows={6} value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} />
        </Field>
      </Section>

      <Section title="Ár">
        <Field label="Ár (Ft)" hint="Ha üresen hagyja, „Ajánlatot kérek” gomb jelenik meg.">
          <input name="price" inputMode="numeric" value={p.price ?? ""} onChange={(e) => setP({ ...p, price: e.target.value === "" ? null : Number(e.target.value.replace(/\D/g, "")) })} />
        </Field>
        <Field label="Akciós ár (Ft)" hint="Ha kitölti, a termék az „Aktuális akciók” között is megjelenik.">
          <input name="sale_price" inputMode="numeric" value={p.sale_price ?? ""} onChange={(e) => setP({ ...p, sale_price: e.target.value === "" ? null : Number(e.target.value.replace(/\D/g, "")) })} />
        </Field>
        <Field label="Egység">
          <input name="price_unit" list="price-units" maxLength={40} value={p.price_unit} placeholder="pl. Ft/zsák" onChange={(e) => setP({ ...p, price_unit: e.target.value })} />
          <datalist id="price-units">{UNITS.map((u) => <option key={u} value={u} />)}</datalist>
        </Field>
      </Section>

      <Section title={`Műszaki adatok – ${area.label}`}>
        {area.specFields.map((f) => (
          <Field key={`${p.area}-${f.key}`} label={`${f.label}${f.unit ? ` (${f.unit})` : ""}`} wide={f.type === "textarea"}>
            {f.type === "textarea"
              ? <textarea name={`spec.${f.key}`} rows={3} defaultValue={p.specs[f.key] ?? ""} placeholder={f.placeholder} />
              : <input name={`spec.${f.key}`} inputMode={f.type === "number" ? "decimal" : undefined} defaultValue={p.specs[f.key] ?? ""} placeholder={f.placeholder} />}
          </Field>
        ))}
      </Section>

      <Section title="Képek és adatlap">
        <Field label="Fő kép" hint="JPG, PNG vagy WebP, max. 5 MB.">
          {p.image_path && !removeMain && (
            <span className="file-current">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview("products", p.image_path)} alt="" width={64} height={64} />
              <Button variant="outline" onClick={() => setRemoveMain(true)}><Trash2 size={14} /> Eltávolítás</Button>
            </span>
          )}
          <input type="file" name="image" accept={ALLOWED_IMAGE_TYPES.join(",")} />
        </Field>
        <Field label={`További képek (galéria, max. ${MAX_GALLERY})`} hint="Több kép is kijelölhető egyszerre.">
          {p.images.length > 0 && (
            <span className="gallery-edit">
              {p.images.map((img) => (
                <button type="button" key={img} className={removeImages.includes(img) ? "removed" : ""} onClick={() => toggle(img)} title={removeImages.includes(img) ? "Visszaállítás" : "Törlésre jelölés"}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview("products", img)} alt="" width={64} height={64} />
                  <span>{removeImages.includes(img) ? "törlésre" : "×"}</span>
                </button>
              ))}
            </span>
          )}
          <input type="file" name="gallery" multiple accept={ALLOWED_IMAGE_TYPES.join(",")} />
        </Field>
        <Field label="Műszaki adatlap (PDF)" hint="Max. 10 MB. Letölthető lesz a termékoldalon.">
          {p.datasheet_path && !removeSheet && (
            <span className="file-current">
              <a href={preview("datasheets", p.datasheet_path)} target="_blank" rel="noopener"><FileText size={16} /> Jelenlegi adatlap</a>
              <Button variant="outline" onClick={() => setRemoveSheet(true)}><Trash2 size={14} /> Eltávolítás</Button>
            </span>
          )}
          <input type="file" name="datasheet" accept="application/pdf" />
        </Field>
      </Section>

      <Section title="Megjelenés">
        <label className="check"><input type="checkbox" name="published" checked={p.published} onChange={(e) => setP({ ...p, published: e.target.checked })} /> Látható a weboldalon</label>
        <label className="check"><input type="checkbox" name="featured" checked={p.featured} onChange={(e) => setP({ ...p, featured: e.target.checked })} /> Kiemelt termék (kezdőlap)</label>
        <Field label="Sorrend" hint="Kisebb szám előrébb kerül.">
          <input name="sort_order" type="number" value={p.sort_order} onChange={(e) => setP({ ...p, sort_order: Number(e.target.value) || 0 })} />
        </Field>
      </Section>

      <div className="row">
        <Button type="submit" disabled={busy}><Save size={16} /> {busy ? "Mentés…" : "Termék mentése"}</Button>
        <Button variant="ghost" onClick={onCancel}>Mégse</Button>
      </div>
    </form>
  );
}
