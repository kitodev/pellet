"use client";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button, StatusMessage } from "@/components/ui";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { saveProduct, deleteProduct } from "@/lib/actions/products";
import { areas, areaKeys, type AreaKey } from "@/lib/content/menu";
import type { Product } from "@/types";
import { ProductForm, emptyProduct, type ProductDraft } from "./ProductForm";
import { ProductList } from "./ProductList";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function ProductsPanel({ products }: { products: Product[] }) {
  const [editing, setEditing] = useState<ProductDraft | null>(null);
  const [area, setArea] = useState<AreaKey | "">("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const { busy, status, run } = useAsyncAction();

  const visible = useMemo(() => products.filter((p) => (!area || p.area === area) && (!category || p.category === category) && (!query || norm(`${p.name} ${p.short_description}`).includes(norm(query)))), [products, area, category, query]);

  async function save(form: FormData) {
    const ok = await run(async () => {
      const result = await saveProduct(form);
      if (!result.success) throw new Error(result.message);
    });
    if (ok) setEditing(null);
  }

  function remove(p: Product) {
    void run(async () => {
      const result = await deleteProduct({ id: p.id });
      if (!result.success) throw new Error(result.message);
    }, "Törölve.");
  }

  return (
    <>
      <StatusMessage>{status}</StatusMessage>
      <div className="admin-toolbar">
        <h2>Termékek</h2>
        <Button onClick={() => { setEditing(emptyProduct(area || "futoanyagok")); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Plus size={16} /> Új termék</Button>
      </div>
      {editing && <ProductForm key={editing.id || "new"} initial={editing} busy={busy} onCancel={() => setEditing(null)} onSubmit={save} />}
      <div className="filters">
        <select aria-label="Menüpont" value={area} onChange={(e) => { setArea(e.target.value as AreaKey | ""); setCategory(""); }}>
          <option value="">Minden menüpont ({products.length})</option>
          {areaKeys.map((k) => <option key={k} value={k}>{areas[k].label} ({products.filter((p) => p.area === k).length})</option>)}
        </select>
        {area && (
          <select aria-label="Kategória" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Minden kategória</option>
            {areas[area].categories.map((c) => <option key={c.slug} value={c.slug}>{c.name} ({products.filter((p) => p.area === area && p.category === c.slug).length})</option>)}
          </select>
        )}
        <label className="search"><Search size={15} /><input aria-label="Keresés a termékek között" placeholder="Keresés…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      </div>
      <ProductList products={visible} busy={busy} onEdit={(p) => { setEditing({ ...p }); window.scrollTo({ top: 0, behavior: "smooth" }); }} onDelete={remove} />
    </>
  );
}
