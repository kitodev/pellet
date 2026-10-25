import { useText } from "@/hooks/useContent";

/** Contact data edited in the admin (Elérhetőségek): contact.phone/email/address/hours/map. */
export function useContactDetails() {
  return {
    phone: useText("contact.phone", ""),
    email: useText("contact.email", ""),
    address: useText("contact.address", ""),
    hours: useText("contact.hours", ""),
    map: useText("contact.map", ""),
    company: useText("contact.company", "Pellet Centrum Kft."),
  };
}
