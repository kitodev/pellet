import { queryOptions } from "@tanstack/react-query";
import { readPublicContent } from "@/lib/actions/content.functions";

export const contentOptions = queryOptions({
  queryKey: ["public-content"],
  queryFn: () => readPublicContent(),
  staleTime: 0,
});
export type PublicContent = Awaited<ReturnType<typeof readPublicContent>>;
