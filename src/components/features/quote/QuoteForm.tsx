import { Text } from "@/components/features/content/ContentProvider";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useText } from "@/hooks/useContent";
import { areas, installationSections, isAreaKey, sectionOf } from "@/lib/content/catalog";
import { sendQuote } from "@/lib/actions/quote.functions";
import { quoteSchema, type QuoteInput } from "@/lib/validations/quote";
import type { Product } from "@/types";

const GENERAL = "Általános érdeklődés";
const SERVICE = "Szerviz, telepítés, beüzemelés";

/** Topics of the general form: every category ("A1 fapellet (Tüzelőanyagok)") with its area. */
const topics = [
  { label: GENERAL, area: "", section: "" },
  { label: SERVICE, area: "", section: "pellet-kalyhak" },
  ...Object.values(areas).flatMap((a) =>
    a.categories.map((c) => ({ label: `${c.name} (${a.label})`, area: a.key, section: c.section })),
  ),
];
const allUnits = ["zsák", "raklap", "kg", "tonna", "db", "m", "csomag"];

type Errors = Partial<Record<keyof QuoteInput | "form", string>>;

/**
 * Árajánlatkérő űrlap. With `product` the product is fixed (product page pop-up);
 * otherwise the visitor picks a topic (Árajánlatkérés / Kapcsolat page).
 * Sends the request to the server (sendQuote) – e-mail to the company + confirmation to the customer.
 */
export function QuoteForm({
  product,
  initialSubject = GENERAL,
  onDone,
}: {
  product?: Product;
  initialSubject?: string;
  onDone?: () => void;
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [startedAt] = useState(() => Date.now());
  const pickup = useText("contact.address", "8000 Székesfehérvár, Seregélyesi út 98, 26-os épület");

  const topic = topics.find((t) => t.label === subject);
  const area = product ? product.area : (topic?.area ?? "");
  const section = product ? sectionOf(product.area, product.category) : topic?.section;
  const units = useMemo(() => (isAreaKey(area) ? areas[area].quoteUnits : allUnits), [area]);
  const askInstallation = !!section && installationSections.includes(section);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => (typeof f.get(k) === "string" ? (f.get(k) as string) : "");
    const input = {
      ...(product ? { product_id: product.id } : {}),
      subject: product ? product.name : subject,
      quantity: s("quantity"),
      unit: s("unit"),
      delivery,
      zip: s("zip"),
      city: s("city"),
      installation: (askInstallation ? s("installation") : "") as QuoteInput["installation"],
      name: s("name"),
      company: s("company"),
      email: s("email"),
      phone: s("phone"),
      message: s("message"),
      consent: f.get("consent") === "on",
      website: s("website"),
      started_at: startedAt,
      page_url: typeof window === "undefined" ? "" : window.location.href.slice(0, 300),
    };
    const parsed = quoteSchema.safeParse(input);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues)
        next[(issue.path[0] as keyof QuoteInput) ?? "form"] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setState("sending");
    try {
      await sendQuote({ data: parsed.data });
      setState("sent");
    } catch (error) {
      setState("idle");
      setErrors({
        form:
          error instanceof Error && error.message
            ? error.message
            : "Az ajánlatkérést nem sikerült elküldeni. Kérjük, próbálja újra.",
      });
    }
  }

  if (state === "sent")
    return (
      <div className="quote-sent" role="status">
        <CheckCircle2 />
        <h3>
          <Text id="quote.sent.title">{"Köszönjük, megkaptuk ajánlatkérését!"}</Text>
        </h3>
        <p>
          <Text id="quote.sent.text">
            {
              "Kollégánk hamarosan felveszi Önnel a kapcsolatot. A megadott e-mail-címre visszaigazolást küldtünk."
            }
          </Text>
        </p>
        {onDone && (
          <Button type="button" variant="outline" onClick={onDone}>
            <Text id="quote.sent.close">{"Bezárás"}</Text>
          </Button>
        )}
      </div>
    );

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <small className="field-error" role="alert">
        {errors[k]}
      </small>
    ) : null;

  return (
    <form className="quote-form" onSubmit={submit} noValidate>
      {product ? (
        <div className="quote-product">
          <span>
            <Text id="quote.product">{"Termék"}</Text>
          </span>
          <strong>
            {product.name}
            {product.brand ? ` – ${product.brand}` : ""}
          </strong>
          {product.packaging && <small>{product.packaging}</small>}
        </div>
      ) : (
        <div>
          <label htmlFor="q-subject">
            <Text id="QuoteForm.text.4">{"Miben segíthetünk?"}</Text>
          </label>
          <select id="q-subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {!topics.some((t) => t.label === subject) && <option>{subject}</option>}
            {topics.map((t) => (
              <option key={t.label}>{t.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-row">
        <div>
          <label htmlFor="q-quantity">
            <Text id="quote.quantity">{"Kért mennyiség"}</Text>
          </label>
          <input
            id="q-quantity"
            name="quantity"
            inputMode="decimal"
            placeholder="pl. 2"
            maxLength={40}
          />
        </div>
        <div>
          <label htmlFor="q-unit">
            <Text id="quote.unit">{"Mértékegység"}</Text>
          </label>
          <select id="q-unit" name="unit" defaultValue={units[0]} key={units.join()}>
            {units.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="quote-choice">
        <legend>
          <Text id="quote.delivery">{"Átvétel módja"}</Text>
        </legend>
        <label>
          <input
            type="radio"
            name="delivery"
            checked={delivery === "pickup"}
            onChange={() => setDelivery("pickup")}
          />
          <span>
            <Text id="quote.pickup">{"Telephelyi átvétel"}</Text>
            <small>{pickup}</small>
          </span>
        </label>
        <label>
          <input
            type="radio"
            name="delivery"
            checked={delivery === "delivery"}
            onChange={() => setDelivery("delivery")}
          />
          <span>
            <Text id="quote.shipping">{"Kiszállítást kérek"}</Text>
            <small>
              <Text id="quote.shippingNote">
                {"Országos kiszállítás, a díjat az ajánlatban jelezzük."}
              </Text>
            </small>
          </span>
        </label>
      </fieldset>
      {delivery === "delivery" && (
        <div className="form-row zip-row">
          <div>
            <label htmlFor="q-zip">
              <Text id="quote.zip">{"Irányítószám *"}</Text>
            </label>
            <input
              id="q-zip"
              name="zip"
              inputMode="numeric"
              maxLength={4}
              autoComplete="postal-code"
              aria-invalid={!!errors.zip}
            />
            {err("zip")}
          </div>
          <div>
            <label htmlFor="q-city">
              <Text id="quote.city">{"Település *"}</Text>
            </label>
            <input
              id="q-city"
              name="city"
              maxLength={120}
              autoComplete="address-level2"
              aria-invalid={!!errors.city}
            />
            {err("city")}
          </div>
        </div>
      )}

      {askInstallation && (
        <fieldset className="quote-choice inline">
          <legend>
            <Text id="quote.installation">{"Kér telepítést vagy beüzemelést?"}</Text>
          </legend>
          {(
            [
              ["yes", "Igen"],
              ["no", "Nem"],
              ["unsure", "Még nem tudom"],
            ] as const
          ).map(([v, l]) => (
            <label key={v}>
              <input type="radio" name="installation" value={v} defaultChecked={v === "unsure"} />
              <span>{l}</span>
            </label>
          ))}
        </fieldset>
      )}

      <div className="form-row">
        <div>
          <label htmlFor="q-name">
            <Text id="QuoteForm.text.1">{"Név *"}</Text>
          </label>
          <input
            id="q-name"
            name="name"
            autoComplete="name"
            maxLength={160}
            aria-invalid={!!errors.name}
          />
          {err("name")}
        </div>
        <div>
          <label htmlFor="q-company">
            <Text id="quote.company">{"Cégnév"}</Text>
          </label>
          <input id="q-company" name="company" autoComplete="organization" maxLength={160} />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label htmlFor="q-email">
            <Text id="QuoteForm.text.2">{"E-mail-cím *"}</Text>
          </label>
          <input
            id="q-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={191}
            placeholder="pelda@email.hu"
            aria-invalid={!!errors.email}
          />
          {err("email")}
        </div>
        <div>
          <label htmlFor="q-phone">
            <Text id="QuoteForm.text.3">{"Telefonszám"}</Text>
          </label>
          <input
            id="q-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            placeholder="+36"
          />
        </div>
      </div>
      <div>
        <label htmlFor="q-message">
          <Text id="quote.message">{"Megjegyzés, egyéb igény"}</Text>
        </label>
        <textarea
          id="q-message"
          name="message"
          maxLength={5000}
          placeholder="pl. szállítási időpont, fizetési mód, kérdések…"
        />
      </div>
      {/* honeypot – hidden from people, bots fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hp-field"
        aria-hidden="true"
      />
      <label className="consent">
        <input type="checkbox" name="consent" aria-invalid={!!errors.consent} />
        <span>
          <Text id="quote.consent">
            {
              "Hozzájárulok, hogy a Pellet Centrum Kft. a megadott adataimat az ajánlatadás céljából kezelje."
            }
          </Text>{" "}
          <Link to="/adatkezeles" target="_blank">
            <Text id="quote.privacy">{"Adatkezelési tájékoztató"}</Text>
          </Link>
          {" *"}
        </span>
      </label>
      {err("consent")}
      {errors.form && (
        <p className="form-error" role="alert">
          {errors.form}
        </p>
      )}
      <Button type="submit" className="h-12" disabled={state === "sending"}>
        {state === "sending" ? <Loader2 className="animate-spin" /> : null}
        <Text id="quote.submit">{"Ajánlatkérés elküldése"}</Text>
        <ArrowRight />
      </Button>
    </form>
  );
}
