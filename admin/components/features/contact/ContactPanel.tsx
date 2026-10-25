"use client";
import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Button, Field, Section, StatusMessage } from "@/components/ui";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { saveTexts } from "@/lib/actions/texts";
import { textDefaults } from "@/lib/content/text-defaults";
import type { SiteText } from "@/types";

const FIELDS: { key: string; label: string; hint?: string; multiline?: boolean }[][] = [
  [
    {
      key: "contact.phone",
      label: "Telefon",
      hint: "pl. +36 30 123 4567 – a fejlécben, a láblécben és a Kapcsolat oldalon is megjelenik.",
    },
    { key: "contact.email", label: "E-mail" },
    {
      key: "contact.address",
      label: "Telephely címe",
      hint: "Teljes cím, pl. 6000 Kecskemét, Minta utca 1.",
    },
    {
      key: "contact.map",
      label: "Térkép keresés (nem kötelező)",
      hint: "Ha a cím nem a pontos helyre mutat, adjon meg itt cégnevet + várost vagy koordinátát.",
    },
    {
      key: "contact.hours",
      label: "Nyitvatartás",
      hint: "Soronként egy nap, pl. H–P: 8–17",
      multiline: true,
    },
  ],
  [
    { key: "about.mission", label: "Küldetés", multiline: true },
    {
      key: "about.history",
      label: "A cég története",
      hint: "Üresen hagyva a blokk nem jelenik meg.",
      multiline: true,
    },
    {
      key: "about.references",
      label: "Referenciák",
      hint: "Üresen hagyva a blokk nem jelenik meg.",
      multiline: true,
    },
    {
      key: "about.certifications",
      label: "Minősítések",
      hint: "pl. ENplus forgalmazói tanúsítvány száma. Üresen hagyva nem jelenik meg.",
      multiline: true,
    },
  ],
];

export function ContactPanel({ texts }: { texts: SiteText[] }) {
  const saved = Object.fromEntries(texts.map((t) => [t.key, t.value]));
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      FIELDS.flat().map((f) => [f.key, saved[f.key] ?? textDefaults[f.key] ?? ""]),
    ),
  );
  const { busy, status, run } = useAsyncAction();

  function submit(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      const r = await saveTexts(
        Object.entries(values).map(([key, value]) => ({ key, value: value.trim() })),
      );
      if (!r.success) throw new Error(r.message);
    });
  }

  const input = (f: (typeof FIELDS)[number][number]) => (
    <Field key={f.key} label={f.label} hint={f.hint} wide={f.multiline}>
      {f.multiline ? (
        <textarea
          rows={4}
          value={values[f.key]}
          onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
        />
      ) : (
        <input
          value={values[f.key]}
          type={f.key === "contact.email" ? "email" : "text"}
          onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
        />
      )}
    </Field>
  );

  return (
    <form className="admin-form" onSubmit={submit}>
      <StatusMessage>{status}</StatusMessage>
      <div className="admin-toolbar">
        <h2>Elérhetőségek és Rólunk</h2>
      </div>
      <Section title="Kapcsolat (Kapcsolat oldal, fejléc, lábléc)">{FIELDS[0]!.map(input)}</Section>
      <Section title="Rólunk oldal">{FIELDS[1]!.map(input)}</Section>
      <div className="row">
        <Button type="submit" disabled={busy}>
          <Save size={16} /> {busy ? "Mentés…" : "Mentés"}
        </Button>
      </div>
    </form>
  );
}
