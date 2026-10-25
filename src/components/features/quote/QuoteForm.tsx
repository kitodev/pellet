import { Text } from "@/components/features/content/ContentProvider";
import { useState } from "react";
import { ArrowRight, Check, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { areas } from "@/lib/content/catalog";

const base = [
  "Általános érdeklődés",
  "Szerviz",
  ...Object.values(areas).flatMap((a) => a.categories.map((c) => `${c.name} (${a.label})`)),
];

export function QuoteForm({
  initialSubject = "Általános érdeklődés",
  kind = "Érdeklődés",
}: {
  initialSubject?: string;
  kind?: string;
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [prepared, setPrepared] = useState("");
  const [copied, setCopied] = useState(false);
  return (
    <form
      className="quote-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setPrepared(
          `${kind} – ${subject}\nNév: ${f.get("name")}\nE-mail: ${f.get("email")}\nTelefon: ${f.get("phone")}\n\n${f.get("message")}`,
        );
        setCopied(false);
      }}
    >
      <div className="form-row">
        <div>
          <label htmlFor="name">
            <Text id="QuoteForm.text.1">{"Név *"}</Text>
          </label>
          <input id="name" name="name" placeholder="Teljes neve" required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email">
            <Text id="QuoteForm.text.2">{"E-mail-cím *"}</Text>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="pelda@email.hu"
            required
            autoComplete="email"
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label htmlFor="phone">
            <Text id="QuoteForm.text.3">{"Telefonszám"}</Text>
          </label>
          <input id="phone" name="phone" type="tel" placeholder="+36" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="subject">
            <Text id="QuoteForm.text.4">{"Miben segíthetünk?"}</Text>
          </label>
          <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {!base.includes(subject) && <option>{subject}</option>}
            {base.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="message">
          <Text id="QuoteForm.text.5">{"Üzenet *"}</Text>
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Írjon néhány szót az igényeiről (mennyiség, típus, helyszín)…"
          required
        />
      </div>
      <p className="form-info">
        <Text id="QuoteForm.text.6">
          {
            "Az üzenet szövege másolásra készül el. Küldés még nincs beállítva; az adatok nem kerülnek továbbításra."
          }
        </Text>
      </p>
      <Button type="submit" className="h-11 text-xs">
        {kind} összeállítása <ArrowRight />
      </Button>
      {prepared && (
        <div role="status" className="border border-border bg-background p-4 rounded-sm">
          <p className="text-sm font-bold text-primary">
            <Text id="QuoteForm.text.7">{"A szöveg elkészült"}</Text>
          </p>
          <textarea aria-label="Összeállított szöveg" value={prepared} readOnly className="mt-3" />
          <Button
            className="mt-3"
            type="button"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(prepared);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? <Check /> : <Clipboard />}
            {copied ? "Szöveg másolva" : "Szöveg másolása"}
          </Button>
        </div>
      )}
    </form>
  );
}
