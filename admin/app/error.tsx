"use client";
import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  return (
    <section className="admin-auth">
      <h1>Hiba történt</h1>
      <p className="admin-status">
        Az oldal nem töltődött be. Ellenőrizze, hogy fut-e a MySQL (XAMPP), majd próbálja újra.
      </p>
      <Button onClick={reset}>Újrapróbálás</Button>
    </section>
  );
}
