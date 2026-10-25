"use client";
import { useActionState } from "react";
import { signIn, type LoginState } from "@/lib/actions/auth";
import { Button, StatusMessage } from "@/components/ui";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  return (
    <>
      <form className="admin-form" action={formAction} noValidate>
        <label>
          E-mail-cím
          <input
            name="email"
            key={state.email ?? ""}
            defaultValue={state.email}
            required
            type="email"
            autoComplete="username"
            aria-invalid={!!state.errors?.email}
          />
          {state.errors?.email && <span className="field-error">{state.errors.email[0]}</span>}
        </label>
        <label>
          Jelszó
          <input
            name="password"
            required
            type="password"
            autoComplete="current-password"
            aria-invalid={!!state.errors?.password}
          />
          {state.errors?.password && (
            <span className="field-error">{state.errors.password[0]}</span>
          )}
        </label>
        <StatusMessage error>{state.message}</StatusMessage>
        <Button type="submit" disabled={pending}>
          {pending ? "Belépés…" : "Belépés"}
        </Button>
      </form>
    </>
  );
}
