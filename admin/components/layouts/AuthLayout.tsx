import { LockKeyhole } from "lucide-react";

export function AuthLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="admin-auth">
      <LockKeyhole className="accent" size={32} />
      <h1>{title}</h1>
      {children}
    </section>
  );
}
