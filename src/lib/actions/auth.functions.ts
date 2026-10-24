import { createServerFn } from '@tanstack/react-start';
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server';
import { loginSchema } from '@/lib/validations/content';
import { SESSION_COOKIE } from '@/lib/db/server/env';
import { createSession, deleteSession, getSessionUser, verifyCredentials } from '@/lib/db/server/auth';

/** Current session: { loggedIn, allowed, email }. */
export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getSessionUser(getCookie(SESSION_COOKIE));
  return { loggedIn: !!user, allowed: !!user?.isAdmin, email: user?.email ?? '' };
});

export const signIn = createServerFn({ method: 'POST' })
  .inputValidator((input) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    const userId = await verifyCredentials(data.email, data.password);
    if (!userId) throw new Error('Sikertelen belépés. Ellenőrizze az e-mail-címet és a jelszót.');
    const { token, expires } = await createSession(userId);
    setCookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', expires, secure: process.env['NODE_ENV'] === 'production' && process.env['INSECURE_COOKIES'] !== 'true' });
    return { ok: true };
  });

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  await deleteSession(getCookie(SESSION_COOKIE));
  deleteCookie(SESSION_COOKIE, { path: '/' });
  return { ok: true };
});
