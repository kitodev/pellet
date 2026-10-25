"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/env";
import { createSession, deleteSession, verifyCredentials } from "@/lib/db/queries/auth";
import { loginSchema } from "@/lib/validations/auth";

export type LoginState = {
  message?: string;
  email?: string;
  errors?: Record<string, string[] | undefined>;
};

/** Email + password sign-in, used with useActionState in LoginForm. */
export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = typeof formData.get("email") === "string" ? (formData.get("email") as string) : "";
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success)
    return {
      email,
      errors: parsed.error.flatten().fieldErrors,
      message: "Ellenőrizze a megadott adatokat.",
    };

  const userId = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!userId)
    return { email, message: "Sikertelen belépés. Ellenőrizze az e-mail-címet és a jelszót." };

  const { token, expires } = await createSession(userId);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "true",
  });
  redirect("/");
}

export async function signOut() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
