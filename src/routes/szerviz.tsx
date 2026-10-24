import { createFileRoute, redirect } from '@tanstack/react-router';

// Old URL → the services page.
export const Route = createFileRoute('/szerviz')({
  beforeLoad: () => { throw redirect({ to: '/szolgaltatasok', statusCode: 301 }); },
});
