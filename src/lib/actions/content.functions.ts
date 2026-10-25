import { createMiddleware, createServerFn } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';
import { z } from 'zod';
import { areas, isAreaKey } from '@/lib/content/catalog';
import { assertAdmin, parseProductForm, productIdSchema, textSchema } from '@/lib/validations/content';
import { SESSION_COOKIE } from '@/lib/db/server/env';
import { getSessionUser } from '@/lib/db/server/auth';
import { deleteProductRow, getProduct, getPublishedPost, listProducts, listPublishedPosts, listReviews, listTexts, upsertProduct, upsertText } from '@/lib/db/server/queries';
import { deleteProductImage, deleteUpload, saveProductImage } from '@/lib/db/server/uploads';

const adminOnly = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await getSessionUser(getCookie(SESSION_COOKIE));
  if (!user) throw new Error('Nincs bejelentkezve.');
  assertAdmin(user.isAdmin);
  return next({ context: { user } });
});

/**
 * Everything the public pages need: texts, published products and reviews.
 * If the database is unreachable the site still renders (default texts, no products)
 * instead of failing with a 500 – the error is logged on the server.
 */
export const readPublicContent = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const [texts, products, reviews] = await Promise.all([listTexts(), listProducts({ publishedOnly: true }), listReviews({ publishedOnly: true })]);
    return { texts, products, reviews, offline: false };
  } catch (error) {
    console.error('[pellet] Adatbázis nem elérhető (DATABASE_URL?):', error);
    return { texts: [], products: [], reviews: [], offline: true };
  }
});

export const listPosts = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    return await listPublishedPosts();
  } catch (error) {
    console.error('[pellet] Cikkek betöltése sikertelen:', error);
    return [];
  }
});

export const readPost = createServerFn({ method: 'GET' })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(191) }).parse(input))
  .handler(async ({ data }) => {
    try {
      return await getPublishedPost(data.slug);
    } catch (error) {
      console.error('[pellet] Cikk betöltése sikertelen:', error);
      return null;
    }
  });

// ---- simple built-in admin (/backend). The full editor is the Next.js admin (admin/). ----
export const readAdminContent = createServerFn({ method: 'POST' }).middleware([adminOnly]).handler(async () => {
  const [texts, products] = await Promise.all([listTexts(), listProducts()]);
  return { texts, products };
});

export const saveText = createServerFn({ method: 'POST' }).middleware([adminOnly]).inputValidator((input) => textSchema.parse(input)).handler(async ({ data }) => {
  await upsertText(data).catch(() => { throw new Error('A szöveg mentése sikertelen.'); });
  return { ok: true };
});

export const saveProduct = createServerFn({ method: 'POST' })
  .middleware([adminOnly])
  .inputValidator((input) => {
    if (!(input instanceof FormData)) throw new Error('Érvénytelen kérés.');
    return input;
  })
  .handler(async ({ data }) => {
    const { product, image } = parseProductForm(data);
    if (!isAreaKey(product.area) || !areas[product.area].categories.some(c => c.slug === product.category)) throw new Error('Ismeretlen kategória.');
    const previous = product.id ? await getProduct(product.id) : null;
    const newImage = image ? await saveProductImage(image) : null;
    const image_path = newImage ?? (product.image_path && product.image_path === previous?.image_path ? previous.image_path : '');
    try {
      await upsertProduct({ ...product, image_path });
    } catch (error) {
      await deleteProductImage(newImage);
      throw error instanceof Error && error.message ? error : new Error('A termék mentése sikertelen.');
    }
    if (previous?.image_path && previous.image_path !== image_path) await deleteProductImage(previous.image_path);
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: 'POST' }).middleware([adminOnly]).inputValidator((input) => productIdSchema.parse(input)).handler(async ({ data }) => {
  const product = await getProduct(data.id);
  if (!product) throw new Error('A termék nem található.');
  await deleteProductRow(data.id);
  await Promise.all([deleteProductImage(product.image_path), ...product.images.map(deleteProductImage), deleteUpload('datasheets', product.datasheet_path)]);
  return { ok: true };
});
