import { createContext } from 'react';
import type { PublicContent } from './queries';

export const ContentContext = createContext<PublicContent | null>(null);
