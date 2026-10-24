import Image from "next/image";
import { SignOutButton } from "@/components/features/auth/SignOutButton";

export function DashboardLayout({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-brand">
          <Image src="/images/logo.jpg" alt="" width={56} height={56} priority />
          <div>
            <span className="eyebrow">Pellet Centrum Kft.</span>
            <h1>Adminisztráció</h1>
          </div>
        </div>
        <div className="row">
          <span>{email}</span>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
