import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getSession, signOut as signOutFn } from '@/lib/actions/auth.functions';
import { adminHead } from '@/lib/utils/seo';
import { AdminEditor } from '@/components/features/admin/AdminEditor';
import { Button } from '@/components/ui/button';
const accessOptions = queryOptions({ queryKey: ['admin-access'], queryFn: () => getSession() });
export const Route = createFileRoute('/_authenticated/backend')({
  head: () => adminHead('Adminisztráció', 'Termékek és weboldalszövegek kezelése.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(accessOptions),
  component: Page,
});
function Page() {
  const { data } = useSuspenseQuery(accessOptions);
  const { queryClient } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  async function signOut() { await queryClient.cancelQueries(); queryClient.clear(); await signOutFn(); await navigate({ to: '/auth', replace: true }); }
  return <div className="admin-shell"><header className="admin-header"><div><span className="eyebrow">Pellet Centrum Kft.</span><h1>Adminisztráció</h1><p className="admin-status mt-3">Egyszerűsített szerkesztő. Árak, műszaki adatok, képgaléria, adatlapok, akciók, vélemények és a Tudástár cikkei az új adminban szerkeszthetők (admin-inditas.bat → localhost:3001).</p></div><div className="flex flex-wrap gap-3 items-center"><span>{data.email}</span><Button variant="outline" onClick={signOut}>Kijelentkezés</Button></div></header>{data.allowed ? <AdminEditor /> : <section className="admin-denied"><h2>Jóváhagyás szükséges</h2><p>Ez a fiók még nem rendelkezik adminisztrátori jogosultsággal.</p></section>}</div>;
}