import { createFileRoute, redirect } from '@tanstack/react-router';

// Old URL → the "Miért minket?" section of the home page.
export const Route = createFileRoute('/miert-minket')({
  beforeLoad: () => { throw redirect({ to: '/', hash: 'miert-minket', statusCode: 301 }); },
});
