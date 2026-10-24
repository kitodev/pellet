import type { ReactNode } from 'react';
import { ContentContext } from '@/lib/content/context';
import type { PublicContent } from '@/lib/content/queries';
import { useText } from '@/hooks/useContent';

export function ContentProvider({ data, children }: { data: PublicContent; children: ReactNode }) {
  return <ContentContext.Provider value={data}>{children}</ContentContext.Provider>;
}

/** Renders an admin-editable text, falling back to the given default. */
export function Text({ id, children }: { id: string; children: string }) {
  return <>{useText(id, children)}</>;
}
