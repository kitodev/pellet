import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/env";
import { findSessionUser } from "@/lib/db/queries/auth";

/** Current user from the session cookie. Cached per request. */
export const getSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = token ? await findSessionUser(token) : null;
  return { user, isAdmin: !!user?.isAdmin } as const;
});

/** For pages: redirects to /login when signed out. */
export async function requireUser() {
  const session = await getSession();
  if (!session.user) redirect("/login");
  return { ...session, user: session.user };
}

/** For Server Actions: throws unless the caller is an admin. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session.user) redirect("/login");
  if (!session.isAdmin) throw new Error("Nincs adminisztrátori jogosultsága.");
  return session.user;
}
