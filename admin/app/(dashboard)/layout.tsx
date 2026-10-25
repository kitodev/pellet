import { requireUser } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { AccessDenied } from "@/components/features/auth/AccessDenied";

export const dynamic = "force-dynamic";

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await requireUser();
  return (
    <DashboardLayout email={user.email ?? ""}>
      {isAdmin ? children : <AccessDenied />}
    </DashboardLayout>
  );
}
