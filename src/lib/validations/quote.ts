import { z } from "zod";

/** Quote request form (Árajánlatkérés) – used by the website form and the server. */
export const quoteSchema = z
  .object({
    product_id: z.string().uuid().optional(),
    /** What the request is about: the product name or the chosen topic */
    subject: z.string().trim().min(1, "Válassza ki, mire kér ajánlatot.").max(250),
    quantity: z.string().trim().max(40),
    unit: z.string().trim().max(40),
    delivery: z.enum(["pickup", "delivery"]),
    zip: z.string().trim().max(10),
    city: z.string().trim().max(120),
    installation: z.enum(["", "yes", "no", "unsure"]),
    name: z.string().trim().min(2, "Adja meg a nevét vagy a cégnevet.").max(160),
    company: z.string().trim().max(160),
    email: z.string().trim().email("Érvényes e-mail-címet adjon meg.").max(191),
    phone: z.string().trim().max(40),
    message: z.string().trim().max(5000),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Az adatkezelési tájékoztató elfogadása szükséges." }),
    }),
    /** honeypot – must stay empty (bots fill it) */
    website: z.string().max(0).optional(),
    /** ms timestamp of when the form was opened (bots submit instantly) */
    started_at: z.number().int().nonnegative(),
    page_url: z.string().max(300).optional(),
  })
  .refine((q) => q.delivery !== "delivery" || /^\d{4}$/.test(q.zip), {
    message: "Kiszállításhoz adja meg a 4 jegyű irányítószámot.",
    path: ["zip"],
  })
  .refine((q) => q.delivery !== "delivery" || q.city.length > 1, {
    message: "Kiszállításhoz adja meg a települést.",
    path: ["city"],
  });

export type QuoteInput = z.infer<typeof quoteSchema>;

export const DELIVERY_LABEL = { pickup: "Telephelyi átvétel", delivery: "Kiszállítás" } as const;
export const INSTALLATION_LABEL = {
  "": "",
  yes: "Igen, telepítést / beüzemelést is kér",
  no: "Nem kér telepítést",
  unsure: "Még nem tudja, tanácsot kér",
} as const;
