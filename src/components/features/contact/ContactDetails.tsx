import { Text } from "@/components/features/content/ContentProvider";
import { useContactDetails } from "@/hooks/useContactDetails";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { jsonLd } from "@/lib/utils/seo";

export function ContactDetails() {
  const c = useContactDetails();
  const rows = [
    c.phone && {
      icon: Phone,
      label: "Telefon",
      value: <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a>,
    },
    c.email && { icon: Mail, label: "E-mail", value: <a href={`mailto:${c.email}`}>{c.email}</a> },
    c.address && { icon: MapPin, label: "Telephely", value: c.address },
    c.hours && {
      icon: Clock,
      label: "Nyitvatartás",
      value: <span className="whitespace-pre-line">{c.hours}</span>,
    },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: React.ReactNode }[];
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: c.company,
    ...(c.phone ? { telephone: c.phone } : {}),
    ...(c.email ? { email: c.email } : {}),
    ...(c.address ? { address: c.address } : {}),
    ...(c.hours ? { openingHours: c.hours.split("\n").filter(Boolean) } : {}),
  };
  return (
    <div className="contact-points">
      {rows.length ? (
        rows.map((r) => (
          <div key={r.label}>
            <r.icon />
            <div>
              <strong>{r.label}</strong>
              <span>{r.value}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="section-copy">
          <Text id="contact.empty">
            {"Elérhetőségeinket hamarosan közzétesszük. Addig is írjon nekünk az űrlapon!"}
          </Text>
        </p>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    </div>
  );
}

/** Google Maps embed for contact.map (or the address); hidden when neither is set. */
export function ContactMap() {
  const c = useContactDetails();
  const query = c.map || c.address;
  if (!query) return null;
  return (
    <iframe
      className="contact-map"
      title="Telephelyünk a térképen"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
    />
  );
}
