import { createFileRoute, Outlet } from '@tanstack/react-router';

// Old section URL (before the menu redesign); children redirect to the new pages.
export const Route = createFileRoute('/takarmany')({ component: Outlet });
