"use client";
import { useState, type FormEvent } from "react";
import { ExternalLink, FileText, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button, Field, Section, StatusMessage } from "@/components/ui";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { deletePost, savePost } from "@/lib/actions/posts";
import { formatDate } from "@/lib/utils/format";
import { siteUrl } from "@/lib/utils/site";
import { slugify } from "@/lib/utils/slug";
import { ALLOWED_IMAGE_TYPES } from "@/lib/validations/product";
import type { BlogPost } from "@/types";

type Draft = Pick<BlogPost, "slug" | "title" | "excerpt" | "meta_description" | "body" | "status" | "cover_path"> & { id: string };
const empty: Draft = { id: "", slug: "", title: "", excerpt: "", meta_description: "", body: "", status: "draft", cover_path: "" };

export function BlogPanel({ posts }: { posts: BlogPost[] }) {
  const [editing, setEditing] = useState<Draft | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const { busy, status, run } = useAsyncAction();

  function open(d: Draft) {
    setEditing(d);
    setSlugTouched(!!d.slug);
    setRemoveCover(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    if (editing.id) form.set("id", editing.id);
    form.set("cover_path", removeCover ? "" : editing.cover_path);
    const ok = await run(async () => {
      const r = await savePost(form);
      if (!r.success) throw new Error(r.message);
    });
    if (ok) setEditing(null);
  }

  return (
    <>
      <StatusMessage>{status}</StatusMessage>
      <div className="admin-toolbar">
        <h2>Tudástár (blog)</h2>
        <Button onClick={() => open({ ...empty })}><Plus size={16} /> Új cikk</Button>
      </div>
      {editing && (
        <form className="admin-form admin-editor" onSubmit={submit} encType="multipart/form-data">
          <div className="admin-toolbar"><h3>{editing.id ? "Cikk szerkesztése" : "Új cikk"}</h3><Button variant="ghost" icon aria-label="Bezárás" onClick={() => setEditing(null)}><X size={18} /></Button></div>
          <Section title="Cikk">
            <Field label="Cím *" wide><input name="title" required maxLength={200} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} /></Field>
            <Field label="URL (webcím)" hint={`/blog/${editing.slug || "…"}`} wide><input name="slug" maxLength={120} value={editing.slug} onChange={(e) => { setSlugTouched(true); setEditing({ ...editing, slug: slugify(e.target.value) }); }} /></Field>
            <Field label="Bevezető" hint="A cikklistában és a cikk tetején jelenik meg." wide><textarea name="excerpt" rows={2} maxLength={500} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></Field>
            <Field label="Google-leírás (meta description)" hint={`${editing.meta_description.length}/160 karakter ajánlott`} wide><textarea name="meta_description" rows={2} maxLength={300} value={editing.meta_description} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} /></Field>
            <Field label="Szöveg (Markdown)" hint="## Alcím · **félkövér** · - felsorolás · [link](/kapcsolat) · táblázat: | a | b |" wide><textarea name="body" className="mono" rows={22} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></Field>
            <Field label="Borítókép" hint="JPG, PNG vagy WebP, max. 5 MB.">
              {editing.cover_path && !removeCover && (
                <span className="file-current">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/uploads/blog/${encodeURIComponent(editing.cover_path)}`} alt="" width={96} height={54} />
                  <Button variant="outline" onClick={() => setRemoveCover(true)}><Trash2 size={14} /> Eltávolítás</Button>
                </span>
              )}
              <input type="file" name="cover" accept={ALLOWED_IMAGE_TYPES.join(",")} />
            </Field>
            <Field label="Állapot">
              <select name="status" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value === "published" ? "published" : "draft" })}>
                <option value="draft">Piszkozat (nem látható)</option>
                <option value="published">Közzétéve</option>
              </select>
            </Field>
          </Section>
          <div className="row"><Button type="submit" disabled={busy}><Save size={16} /> {busy ? "Mentés…" : "Cikk mentése"}</Button></div>
        </form>
      )}
      {!posts.length && <p className="muted">Még nincs cikk.</p>}
      <div className="admin-list">
        {posts.map((p) => (
          <article key={p.id}>
            <span className="admin-thumb icon" aria-hidden="true"><FileText /></span>
            <div>
              <strong>{p.title}</strong>
              <small>{p.status === "published" ? `Közzétéve: ${formatDate(p.published_at)}` : "Piszkozat"} · /blog/{p.slug}</small>
              <p>{p.excerpt}</p>
            </div>
            <div className="row">
              {p.status === "published" && <a className="btn btn-ghost btn-icon" href={siteUrl(`/blog/${p.slug}`)} target="_blank" rel="noopener" aria-label={`${p.title} megnyitása a weboldalon`}><ExternalLink size={16} /></a>}
              <Button variant="outline" icon aria-label={`${p.title} szerkesztése`} onClick={() => open({ id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, meta_description: p.meta_description, body: p.body, status: p.status, cover_path: p.cover_path })}><Pencil size={16} /></Button>
              <Button variant="outline" icon aria-label={`${p.title} törlése`} onClick={() => setConfirming(p.id)}><Trash2 size={16} /></Button>
            </div>
            {confirming === p.id && (
              <div className="admin-confirm"><p>Végleg törli ezt a cikket?</p>
                <Button variant="danger" disabled={busy} onClick={() => { setConfirming(null); void run(async () => { const x = await deletePost({ id: p.id }); if (!x.success) throw new Error(x.message); }, "Törölve."); }}>Törlés</Button>
                <Button variant="outline" onClick={() => setConfirming(null)}>Mégse</Button></div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
