import { useState, type FormEvent } from 'react';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Plus, Pencil, Trash2, Save, X, Upload, Package, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { areas, isAreaKey } from '@/lib/content/catalog';
import { textDefaults } from '@/lib/content/text-defaults';
import { readAdminContent, saveText, saveProduct, deleteProduct } from '@/lib/actions/content.functions';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, type ProductInput } from '@/lib/validations/content';

const adminOptions = queryOptions({ queryKey: ['admin-content'], queryFn: () => readAdminContent() });
const areaOf = (value: string): ProductInput['area'] => (isAreaKey(value) ? value : 'futoanyagok');
const emptyProduct: ProductInput = { area: 'futoanyagok', category: 'fa-pellet', name: '', description: '', image_path: '' };
export function AdminEditor() {
  const { data } = useSuspenseQuery(adminOptions); const client = useQueryClient();
  const saveTextFn = useServerFn(saveText); const saveProductFn = useServerFn(saveProduct); const deleteFn = useServerFn(deleteProduct);
  const [tab, setTab] = useState<'products' | 'texts'>('products'); const [product, setProduct] = useState<ProductInput | null>(null);
  const [file, setFile] = useState<File | null>(null); const [status, setStatus] = useState(''); const [busy, setBusy] = useState(false);
  const [textKey, setTextKey] = useState(''); const [value, setValue] = useState(''); const [filter, setFilter] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  async function refresh() { await client.invalidateQueries({ queryKey: ['admin-content'] }); await client.invalidateQueries({ queryKey: ['public-content'] }); }
  async function run(action: () => Promise<void>) { setBusy(true); setStatus(''); try { await action(); await refresh(); setStatus('Mentve.'); } catch (error) { setStatus(error instanceof Error ? error.message : 'Sikertelen művelet.'); } finally { setBusy(false); } }
  async function submitProduct(event: FormEvent) { event.preventDefault(); if (!product) return; const current = product; await run(async () => {
    if (file && !(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) throw new Error('JPG, PNG vagy WebP képet válasszon.');
    if (file && file.size > MAX_IMAGE_BYTES) throw new Error('A kép legfeljebb 5 MB lehet.');
    const form = new FormData();
    if (current.id) form.set('id', current.id);
    form.set('area', current.area); form.set('category', current.category); form.set('name', current.name); form.set('description', current.description); form.set('image_path', current.image_path);
    if (file) form.set('image', file);
    await saveProductFn({ data: form });
    setProduct(null); setFile(null);
  }); }
  const texts = { ...textDefaults, ...Object.fromEntries(data.texts.map(t => [t.key, t.value])) };
  return <><nav className="admin-tabs"><Button variant={tab === 'products' ? 'default' : 'ghost'} onClick={() => setTab('products')}><Package /> Termékek ({data.products.length})</Button><Button variant={tab === 'texts' ? 'default' : 'ghost'} onClick={() => setTab('texts')}><FileText /> Weboldalszövegek</Button></nav>{status && <p role="status" className="admin-status">{status}</p>}
    {tab === 'products' ? <><div className="admin-toolbar"><h2>Termékek</h2><Button onClick={() => { setProduct({ ...emptyProduct }); setFile(null); }}><Plus /> Új termék</Button></div>
      {product && <form className="admin-form admin-editor" onSubmit={submitProduct}><div className="admin-toolbar"><h3>{product.id ? 'Termék szerkesztése' : 'Új termék'}</h3><Button type="button" variant="ghost" size="icon" aria-label="Szerkesztés bezárása" onClick={() => setProduct(null)}><X /></Button></div><div className="form-row"><label>Tevékenység<select value={product.area} onChange={e => { const area = areaOf(e.target.value); setProduct({ ...product, area, category: areas[area].categories[0]?.slug ?? '' }); }}>{Object.values(areas).map(a => <option key={a.key} value={a.key}>{a.label}</option>)}</select></label><label>Kategória<select value={product.category} onChange={e => setProduct({ ...product, category: e.target.value })}>{areas[product.area].categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label></div><label>Terméknév<input required maxLength={200} value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })} /></label><label>Leírás<textarea rows={5} value={product.description} onChange={e => setProduct({ ...product, description: e.target.value })} /></label><label className="admin-upload"><Upload size={18} /> Termékkép<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] ?? null)} /></label>{product.image_path && <Button type="button" variant="outline" onClick={() => setProduct({ ...product, image_path: '' })}><Trash2 /> Kép eltávolítása</Button>}<Button type="submit" disabled={busy}><Save /> {busy ? 'Mentés…' : 'Termék mentése'}</Button></form>}
      {!data.products.length && <p className="text-muted-foreground py-12">Még nincs feltöltött termék.</p>}
      <div className="admin-list">{data.products.map(p => <article key={p.id}><div><strong>{p.name}</strong><small>{areas[areaOf(p.area)].label} · {p.category}</small><p>{p.description}</p></div><div className="flex gap-2"><Button variant="outline" size="icon" aria-label={`${p.name} szerkesztése`} onClick={() => { setProduct({ id: p.id, area: areaOf(p.area), category: p.category, name: p.name, description: p.description, image_path: p.image_path }); setFile(null); }}><Pencil /></Button><Button variant="outline" size="icon" aria-label={`${p.name} törlése`} onClick={() => setDeleting(p.id)}><Trash2 /></Button></div>{deleting === p.id && <div className="admin-confirm"><p>Végleg törli ezt a terméket?</p><Button variant="destructive" disabled={busy} onClick={() => run(async () => { await deleteFn({ data: { id: p.id } }); setDeleting(null); })}>Törlés</Button><Button variant="outline" onClick={() => setDeleting(null)}>Mégse</Button></div>}</article>)}</div></> : <><div className="admin-toolbar"><h2>Weboldalszövegek</h2><input aria-label="Szövegek szűrése" placeholder="Keresés…" value={filter} onChange={e => setFilter(e.target.value)} /></div>{textKey && <form className="admin-form admin-editor" onSubmit={e => { e.preventDefault(); void run(async () => { await saveTextFn({ data: { key: textKey, value } }); setTextKey(''); }); }}><label>{textKey}<textarea aria-label="Szöveg" rows={6} value={value} onChange={e => setValue(e.target.value)} /></label><div className="flex gap-3"><Button disabled={busy} type="submit"><Save /> Szöveg mentése</Button><Button type="button" variant="outline" onClick={() => setValue('')}>Szöveg kiürítése</Button><Button type="button" variant="ghost" onClick={() => setTextKey('')}>Mégse</Button></div></form>}<div className="admin-list">{Object.entries(texts).filter(([key, text]) => `${key} ${text}`.toLowerCase().includes(filter.toLowerCase())).map(([key, text]) => <article key={key}><div><small>{key}</small><p>{text || '—'}</p></div><Button variant="outline" size="icon" aria-label={`${key} szerkesztése`} onClick={() => { setTextKey(key); setValue(text); }}><Pencil /></Button></article>)}</div></>}
  </>;
}