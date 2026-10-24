import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { LoginForm } from "@/components/features/auth/LoginForm";

export const metadata: Metadata = { title: "Adminisztrátori belépés" };

export default async function LoginPage() {
  const { user } = await getSession();
  if (user) redirect("/");
  return (
    <AuthLayout title="Adminisztrátori belépés">
      <LoginForm />
    </AuthLayout>
  );
}
