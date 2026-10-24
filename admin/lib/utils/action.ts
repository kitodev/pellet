import { ZodError } from "zod";
import type { ActionResult } from "@/types";

/** Wraps Server Action bodies so they always return an ActionResult instead of throwing. */
export async function toActionResult<T>(fn: () => Promise<T>, fallback = "Sikertelen művelet."): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    // Let Next.js redirects/notFound propagate.
    if (error && typeof error === "object" && "digest" in error) throw error;
    if (error instanceof ZodError) {
      return { success: false, message: error.issues[0]?.message ?? fallback, errors: error.flatten().fieldErrors };
    }
    // Database / system errors: log the details, show a friendly message.
    if (error && typeof error === "object" && ("sqlMessage" in error || "errno" in error || "code" in error)) {
      console.error(error);
      return { success: false, message: fallback };
    }
    return { success: false, message: error instanceof Error && error.message ? error.message : fallback };
  }
}
