"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/** Runs an async mutation, tracks busy/status, and refreshes server data on success. */
export function useAsyncAction() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function run(action: () => Promise<void>, successMessage = "Mentve.") {
    setBusy(true);
    setStatus("");
    try {
      await action();
      setStatus(successMessage);
      startTransition(() => router.refresh());
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sikertelen művelet.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { busy, status, setStatus, run };
}
