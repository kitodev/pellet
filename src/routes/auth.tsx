import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { signIn } from "@/lib/actions/auth.functions";
import { adminHead } from "@/lib/utils/seo";
import { Button } from "@/components/ui/button";
import { LockKeyhole, ArrowLeft } from "lucide-react";
export const Route = createFileRoute("/auth")({
  head: () => adminHead("Adminisztrátori belépés", "Biztonságos belépés a tartalomkezeléshez."),
  component: Auth,
});
function Auth() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const signInFn = useServerFn(signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signInFn({ data: { email, password } });
    } catch {
      setBusy(false);
      setError("Sikertelen belépés. Ellenőrizze az e-mail-címet és a jelszót.");
      return;
    }
    setBusy(false);
    queryClient.clear();
    await navigate({ to: "/backend" });
  }
  return (
    <section className="admin-auth">
      <Link to="/" className="flex gap-2 items-center">
        <ArrowLeft size={16} /> Vissza a weboldalra
      </Link>
      <LockKeyhole className="mt-12 text-primary" size={32} />
      <h1>Adminisztrátori belépés</h1>
      <form className="admin-form" onSubmit={submit}>
        <label>
          E-mail-cím
          <input
            required
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Jelszó
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <Button disabled={busy} type="submit">
          {busy ? "Belépés…" : "Belépés"}
        </Button>
      </form>
      <div className="grid gap-3 mt-5">
        <Button variant="ghost" onClick={() => navigate({ to: "/backend" })}>
          Már bejelentkeztem
        </Button>
      </div>
    </section>
  );
}
