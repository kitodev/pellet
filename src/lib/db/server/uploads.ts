import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { serverEnv } from './env';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/validations/content';
import type { UploadFolder } from '@/lib/utils/urls';

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MIME: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf' };
const FOLDERS: Record<UploadFolder, RegExp> = {
  products: /\.(jpe?g|png|webp)$/i,
  blog: /\.(jpe?g|png|webp)$/i,
  datasheets: /\.pdf$/i,
};
const dir = (folder: UploadFolder) => path.join(serverEnv().uploadsDir, folder);

/** Only plain file names like "uuid.jpg" are accepted – blocks path traversal. */
export function safeName(folder: UploadFolder, name: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name) && FOLDERS[folder].test(name) ? name : null;
}
export const isUploadFolder = (value: string): value is UploadFolder => value in FOLDERS;

export async function saveProductImage(file: File): Promise<string> {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) throw new Error('JPG, PNG vagy WebP képet válasszon.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('A kép legfeljebb 5 MB lehet.');
  const name = `${randomUUID()}.${EXT[file.type]}`;
  await mkdir(dir('products'), { recursive: true });
  await writeFile(path.join(dir('products'), name), Buffer.from(await file.arrayBuffer()));
  return name;
}

export async function deleteUpload(folder: UploadFolder, name: string | null | undefined) {
  const safe = name ? safeName(folder, name) : null;
  if (safe) await unlink(path.join(dir(folder), safe)).catch(() => undefined);
}
export const deleteProductImage = (name: string | null | undefined) => deleteUpload('products', name);

export async function readUpload(folder: UploadFolder, name: string): Promise<{ body: Buffer; type: string } | null> {
  const safe = safeName(folder, name);
  if (!safe) return null;
  try {
    const body = await readFile(path.join(dir(folder), safe));
    return { body, type: MIME[safe.split('.').pop()!.toLowerCase()] ?? 'application/octet-stream' };
  } catch {
    return null;
  }
}
