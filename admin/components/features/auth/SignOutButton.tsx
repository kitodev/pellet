import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button variant="outline" type="submit">Kijelentkezés</Button>
    </form>
  );
}
