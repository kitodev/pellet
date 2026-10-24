/** Uniform return type for every Server Action. */
export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; errors?: Record<string, string[] | undefined> };
