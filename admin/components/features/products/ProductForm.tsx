"use client";
import { useState, type FormEvent } from "react";
import { FileText, Save, Trash2, X } from "lucide-react";
import { Button, Field, Section } from "@/components/ui";
import { areas, areaKeys, groupedCategories, type AreaKey } from "@/lib/content/menu";
import { slugify } from "@/lib/utils/slug";
import { fileUrl } from "@/lib/utils/file-url";
import { ALLOWED_IMAGE_TYPES, MAX_GALLERY } from "@/lib/validations/product";
import type { Product } from "@/types";

export type ProductDraft = Omit<Product, "created_at" | "images"> & { images: string[] };

export const emptyProduct = (area: AreaKey = "futoanyagok"): ProductDraft => ({
  id: "",
  slug: "",
  area,
  category: areas[area].categories[0]!.slug,
  name: "",
  brand: "",
  short_description: "",
  description: "",
  price: null,
  sale_price: null,
  price_unit: "",
  specs: {},
  image_path: "",
  images: [],
  datasheet_path: "",
  packaging: "",
  highlights: "",
  stock_status: "in_stock",
  price_mode: "ask",
  price_note: "",
  seo_title: "",
  meta_description: "",
  keywords: "",
  image_alt: "",
  documents: [],
  featured: false,
  published: true,
  sort_order: 0,
});

const preview = fileUrl;
const DOC_KINDS = {
  certificate: "Minőségi tanúsítvány",
  manual: "Használati útmutató",
  other: "Egyéb dokumentum",
} as const;
const UNITS = ["Ft/zsák", "Ft/raklap", "Ft/kg", "Ft/tonna", "Ft/db", "Ft/m³", "Ft/csomag"];

type Props = {
  initial: ProductDraft;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (form: FormData) => void;
};

export function ProductForm({ initial, busy, onCancel, onSubmit }: Props) {
  const [p, setP] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [removeImages, setRemoveImages] = useState<string[]>([]);
  const [removeMain, setRemoveMain] = useState(false);
  const [removeSheet, setRemoveSheet] = useState(false);
  const [removeDocs, setRemoveDocs] = useState<string[]>([]);
  const area = areas[p.area as AreaKey] ?? areas.futoanyagok;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (p.id) form.set("id", p.id);
    form.set("image_path", removeMain ? "" : p.image_path);
    form.set("datasheet_path", removeSheet ? "" : p.datasheet_path);
    for (const r of removeImages) form.append("remove_images", r);
    for (const d of removeDocs) form.append("remove_documents", d);
    onSubmit(form);
  }

  const toggle = (name: string) =>
    setRemoveImages((list) =>
      list.includes(name) ? list.filter((x) => x !== name) : [...list, name],
    );

  return (
    <form className="admin-form admin-editor" onSubmit={submit} encType="multipart/form-data">
      <div className="admin-toolbar">
        <h3>{p.id ? "Termék szerkesztése" : "Új termék"}</h3>
        <Button variant="ghost" icon aria-label="Szerkesztés bezárása" onClick={onCancel}>
          <X size={18} />
        </Button>
      </div>

      <Section title="Alapadatok">
        <Field label="Menüpont">
          <select
            name="area"
            value={p.area}
            onChange={(e) => {
              const a = e.target.value as AreaKey;
              setP({ ...p, area: a, category: areas[a].categories[0]!.slug });
            }}
          >
            {areaKeys.map((k) => (
              <option key={k} value={k}>
                {areas[k].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Kategória (almenü)">
          <select
            name="category"
            value={p.category}
            onChange={(e) => setP({ ...p, category: e.target.value })}
          >
            {groupedCategories(area).map((g) =>
              g.group ? (
                <optgroup key={g.group} label={g.group}>
                  {g.categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              ) : (
                g.categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))
              ),
            )}
          </select>
        </Field>
        <Field label="Terméknév *" wide>
          <input
            name="name"
            required
            maxLength={200}
            value={p.name}
            onChange={(e) =>
              setP({
                ...p,
                name: e.target.value,
                ...(slugTouched ? {} : { slug: slugify(e.target.value) }),
              })
            }
          />
        </Field>
        <Field label="URL (webcím)" hint={`/${p.area}/${p.category}/${p.slug || "…"}`} wide>
          <input
            name="slug"
            maxLength={120}
            pattern="[a-z0-9-]*"
            value={p.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setP({ ...p, slug: slugify(e.target.value).slice(0, 120) || "" });
            }}
          />
        </Field>
        <Field label="Gyártó / márka" hint="pl. Mareli, ENplus-minősített gyártó neve">
          <input
            name="brand"
            maxLength={120}
            value={p.brand}
            onChange={(e) => setP({ ...p, brand: e.target.value })}
          />
        </Field>
        <Field
          label="Kiszerelés / méret / teljesítmény"
          hint="pl. 15 kg/zsák · 10 kW · Ø 80 mm, 1 m"
        >
          <input
            name="packaging"
            maxLength={200}
            value={p.packaging}
            onChange={(e) => setP({ ...p, packaging: e.target.value })}
          />
        </Field>
        <Field label="Elérhetőség">
          <select
            name="stock_status"
            value={p.stock_status}
            onChange={(e) =>
              setP({ ...p, stock_status: e.target.value as ProductDraft["stock_status"] })
            }
          >
            <option value="in_stock">Raktáron</option>
            <option value="limited">Korlátozott készlet</option>
            <option value="on_order">Rendelésre</option>
            <option value="out_of_stock">Jelenleg nem elérhető</option>
          </select>
        </Field>
        <Field
          label="Legfontosabb jellemzők"
          hint="Soronként egy jellemző (4–6 sor) – a termékoldalon pipás listaként jelenik meg."
          wide
        >
          <textarea
            name="highlights"
            rows={5}
            maxLength={3000}
            value={p.highlights}
            placeholder={"pl. ENplus A1 minősítés\nAlacsony hamutartalom (≤ 0,7%)\n6 mm átmérő"}
            onChange={(e) => setP({ ...p, highlights: e.target.value })}
          />
        </Field>
        <Field
          label="Rövid leírás"
          hint="2–4 mondatos bemutatás – a termékoldal tetején, a termékkártyán és a Google-találatban jelenik meg (max. 300 karakter)."
          wide
        >
          <textarea
            name="short_description"
            rows={2}
            maxLength={300}
            value={p.short_description}
            onChange={(e) => setP({ ...p, short_description: e.target.value })}
          />
        </Field>
        <Field label="Részletes leírás" wide>
          <textarea
            name="description"
            rows={6}
            value={p.description}
            onChange={(e) => setP({ ...p, description: e.target.value })}
          />
        </Field>
      </Section>

      <Section title="Ár">
        <Field label="Ár megjelenítése">
          <select
            name="price_mode"
            value={p.price_mode}
            onChange={(e) =>
              setP({ ...p, price_mode: e.target.value as ProductDraft["price_mode"] })
            }
          >
            <option value="public">Nyilvános bruttó fogyasztói ár</option>
            <option value="ask">„Árért érdeklődjön”</option>
            <option value="quantity">Mennyiségtől függő, egyedi árajánlat</option>
          </select>
        </Field>
        <Field
          label="Ár (Ft, bruttó)"
          hint="Csak „Nyilvános bruttó fogyasztói ár” esetén jelenik meg."
        >
          <input
            name="price"
            inputMode="numeric"
            value={p.price ?? ""}
            onChange={(e) =>
              setP({
                ...p,
                price: e.target.value === "" ? null : Number(e.target.value.replace(/\D/g, "")),
              })
            }
          />
        </Field>
        <Field
          label="Akciós ár (Ft)"
          hint="Ha kitölti, a termék az „Aktuális akciók” között is megjelenik."
        >
          <input
            name="sale_price"
            inputMode="numeric"
            value={p.sale_price ?? ""}
            onChange={(e) =>
              setP({
                ...p,
                sale_price:
                  e.target.value === "" ? null : Number(e.target.value.replace(/\D/g, "")),
              })
            }
          />
        </Field>
        <Field label="Egység">
          <input
            name="price_unit"
            list="price-units"
            maxLength={40}
            value={p.price_unit}
            placeholder="pl. Ft/zsák"
            onChange={(e) => setP({ ...p, price_unit: e.target.value })}
          />
          <datalist id="price-units">
            {UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </Field>
        <Field
          label="Megjegyzés az ár mellett"
          hint="pl. Az ár a szállítási díjat nem tartalmazza. · Raklapos tételnél kedvezmény."
          wide
        >
          <input
            name="price_note"
            maxLength={300}
            value={p.price_note}
            onChange={(e) => setP({ ...p, price_note: e.target.value })}
          />
        </Field>
      </Section>

      <Section title={`Műszaki adatok – ${area.label}`}>
        {area.specFields.map((f) => (
          <Field
            key={`${p.area}-${f.key}`}
            label={`${f.label}${f.unit ? ` (${f.unit})` : ""}`}
            wide={f.type === "textarea"}
          >
            {f.type === "textarea" ? (
              <textarea
                name={`spec.${f.key}`}
                rows={3}
                defaultValue={p.specs[f.key] ?? ""}
                placeholder={f.placeholder}
              />
            ) : (
              <input
                name={`spec.${f.key}`}
                inputMode={f.type === "number" ? "decimal" : undefined}
                defaultValue={p.specs[f.key] ?? ""}
                placeholder={f.placeholder}
              />
            )}
          </Field>
        ))}
      </Section>

      <Section title="Képek és dokumentumok">
        <Field label="Fő kép" hint="JPG, PNG vagy WebP, max. 5 MB.">
          {p.image_path && !removeMain && (
            <span className="file-current">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview("products", p.image_path)} alt="" width={64} height={64} />
              <Button variant="outline" onClick={() => setRemoveMain(true)}>
                <Trash2 size={14} /> Eltávolítás
              </Button>
            </span>
          )}
          <input type="file" name="image" accept={ALLOWED_IMAGE_TYPES.join(",")} />
        </Field>
        <Field
          label="A fő kép leírása (alt szöveg)"
          hint="Google-képkereséshez; üresen a terméknév."
        >
          <input
            name="image_alt"
            maxLength={200}
            value={p.image_alt}
            placeholder={p.name}
            onChange={(e) => setP({ ...p, image_alt: e.target.value })}
          />
        </Field>
        <Field
          label={`További képek (galéria, max. ${MAX_GALLERY})`}
          hint="Több kép is kijelölhető egyszerre."
        >
          {p.images.length > 0 && (
            <span className="gallery-edit">
              {p.images.map((img) => (
                <button
                  type="button"
                  key={img}
                  className={removeImages.includes(img) ? "removed" : ""}
                  onClick={() => toggle(img)}
                  title={removeImages.includes(img) ? "Visszaállítás" : "Törlésre jelölés"}
                >
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
              <a href={preview("datasheets", p.datasheet_path)} target="_blank" rel="noopener">
                <FileText size={16} /> Jelenlegi adatlap
              </a>
              <Button variant="outline" onClick={() => setRemoveSheet(true)}>
                <Trash2 size={14} /> Eltávolítás
              </Button>
            </span>
          )}
          <input type="file" name="datasheet" accept="application/pdf" />
        </Field>
        {p.documents.length > 0 && (
          <Field label="Feltöltött dokumentumok" hint="Kattintson a törléshez jelöléshez." wide>
            <span className="doc-edit">
              {p.documents.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  className={removeDocs.includes(d.id) ? "removed" : ""}
                  onClick={() =>
                    setRemoveDocs((l) =>
                      l.includes(d.id) ? l.filter((x) => x !== d.id) : [...l, d.id],
                    )
                  }
                >
                  <FileText size={14} /> {d.title || DOC_KINDS[d.kind]} ({DOC_KINDS[d.kind]})
                  <span>{removeDocs.includes(d.id) ? " – törlésre" : " ×"}</span>
                </button>
              ))}
            </span>
          </Field>
        )}
        {(Object.keys(DOC_KINDS) as (keyof typeof DOC_KINDS)[]).map((kind) => (
          <Field
            key={kind}
            label={`${DOC_KINDS[kind]} (PDF)`}
            hint="Több fájl is választható, max. 10 MB/db."
          >
            <input type="file" name={`doc.${kind}`} multiple accept="application/pdf" />
            <input
              name={`doc_title.${kind}`}
              maxLength={200}
              placeholder="Megnevezés (nem kötelező)"
            />
          </Field>
        ))}
      </Section>

      <Section title="Keresőoptimalizálás (Google)">
        <Field
          label="SEO-cím"
          hint={`A böngészőfülön és a Google-találat címében. Üresen: „${p.name || "Terméknév"}${p.brand ? ` – ${p.brand}` : ""}”. Ajánlott max. 60 karakter (${p.seo_title.length}).`}
          wide
        >
          <input
            name="seo_title"
            maxLength={200}
            value={p.seo_title}
            onChange={(e) => setP({ ...p, seo_title: e.target.value })}
          />
        </Field>
        <Field
          label="Meta leírás"
          hint={`A Google-találat szövege. Üresen a rövid leírás. Ajánlott 120–160 karakter (${p.meta_description.length}).`}
          wide
        >
          <textarea
            name="meta_description"
            rows={2}
            maxLength={300}
            value={p.meta_description}
            onChange={(e) => setP({ ...p, meta_description: e.target.value })}
          />
        </Field>
        <Field
          label="Keresőkifejezések"
          hint="Vesszővel elválasztva, pl. fapellet, ENplus A1, pellet 15 kg"
          wide
        >
          <input
            name="keywords"
            maxLength={300}
            value={p.keywords}
            onChange={(e) => setP({ ...p, keywords: e.target.value })}
          />
        </Field>
      </Section>

      <Section title="Megjelenés">
        <label className="check">
          <input
            type="checkbox"
            name="published"
            checked={p.published}
            onChange={(e) => setP({ ...p, published: e.target.checked })}
          />{" "}
          Látható a weboldalon
        </label>
        <label className="check">
          <input
            type="checkbox"
            name="featured"
            checked={p.featured}
            onChange={(e) => setP({ ...p, featured: e.target.checked })}
          />{" "}
          Kiemelt termék (kezdőlap)
        </label>
        <Field label="Sorrend" hint="Kisebb szám előrébb kerül.">
          <input
            name="sort_order"
            type="number"
            value={p.sort_order}
            onChange={(e) => setP({ ...p, sort_order: Number(e.target.value) || 0 })}
          />
        </Field>
      </Section>

      <div className="row">
        <Button type="submit" disabled={busy}>
          <Save size={16} /> {busy ? "Mentés…" : "Termék mentése"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Mégse
        </Button>
      </div>
    </form>
  );
}
