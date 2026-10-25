"use client";
import { useMemo, useState } from "react";
import { Pencil, Save } from "lucide-react";
import { Button, StatusMessage } from "@/components/ui";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { saveText } from "@/lib/actions/texts";
import { textDefaults } from "@/lib/content/text-defaults";
import type { SiteText } from "@/types";

export function TextsPanel({ texts: saved }: { texts: SiteText[] }) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [filter, setFilter] = useState("");
  const { busy, status, run } = useAsyncAction();

  const texts = useMemo(
    () => ({ ...textDefaults, ...Object.fromEntries(saved.map((t) => [t.key, t.value])) }),
    [saved],
  );
  // contact.* and about.* are edited in the "Elérhetőségek" tab.
  const visible = Object.entries(texts)
    .filter(
      ([k]) =>
        !/^(contact|about)\.(phone|email|address|hours|map|mission|history|references|certifications)$/.test(
          k,
        ),
    )
    .filter(([k, t]) => `${k} ${t}`.toLowerCase().includes(filter.toLowerCase()));

  async function submit() {
    const ok = await run(async () => {
      const result = await saveText({ key, value });
      if (!result.success) throw new Error(result.message);
    });
    if (ok) setKey("");
  }

  return (
    <>
      <StatusMessage>{status}</StatusMessage>
      <div className="admin-toolbar">
        <h2>Weboldalszövegek</h2>
        <input
          aria-label="Szövegek szűrése"
          placeholder="Keresés…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      {key && (
        <form
          className="admin-form admin-editor"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label>
            {key}
            <textarea
              aria-label="Szöveg"
              rows={6}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <div className="row">
            <Button type="submit" disabled={busy}>
              <Save size={16} /> Szöveg mentése
            </Button>
            <Button variant="outline" onClick={() => setValue("")}>
              Szöveg kiürítése
            </Button>
            <Button variant="ghost" onClick={() => setKey("")}>
              Mégse
            </Button>
          </div>
        </form>
      )}
      <div className="admin-list">
        {visible.map(([k, t]) => (
          <article key={k}>
            <div>
              <small>{k}</small>
              <p>{t || "—"}</p>
            </div>
            <Button
              variant="outline"
              icon
              aria-label={`${k} szerkesztése`}
              onClick={() => {
                setKey(k);
                setValue(t);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Pencil size={16} />
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
