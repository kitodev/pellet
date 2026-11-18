import { useText } from "@/hooks/useContent";

/** Contact data edited in the admin (Elérhetőségek): contact.phone/email/address/hours/map. */
export function useContactDetails() {
  return {
    phone: useText("contact.phone", ""),
    email: useText("contact.email", ""),
    address: useText("contact.address", "8000 Székesfehérvár, Seregélyesi út 98, 26-os épület"),
    hours: useText("contact.hours", ""),
    // Google Maps search for the map (the building number "26-os épület" would confuse it)
    map: useText("contact.map", "8000 Székesfehérvár, Seregélyesi út 98"),
    company: useText("contact.company", "Pellet Centrum Kft."),
  };
}
