// 004: load the Tudástár article drafts (database/seed/blog/*.md) as DRAFTS.
// They are not public until an admin publishes them.
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "seed", "blog");

function parse(md) {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(md.replace(/\r\n/g, "\n"));
  if (!m) throw new Error("missing front matter");
  const meta = Object.fromEntries(
    m[1]
      .split("\n")
      .filter(Boolean)
      .map((l) => {
        const i = l.indexOf(":");
        return [
          l.slice(0, i).trim(),
          l
            .slice(i + 1)
            .trim()
            .replace(/^"(.*)"$/, "$1"),
        ];
      }),
  );
  return { ...meta, body: m[2].trim() + "\n" };
}

export default async function up(db) {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
  let added = 0;
  for (const file of files) {
    const post = parse(await readFile(path.join(dir, file), "utf8"));
    const [res] = await db.query(
      `INSERT IGNORE INTO blog_posts (id, slug, title, excerpt, body, meta_description, status) VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
      [randomUUID(), post.slug, post.title, post.excerpt ?? "", post.body, post.description ?? ""],
    );
    added += res.affectedRows;
  }
  return `${added} cikk-piszkozat betöltve`;
}
