import { createFileRoute } from '@tanstack/react-router';
import { isUploadFolder, readUpload } from '@/lib/db/server/uploads';

// Serves uploaded files: /uploads/products/*.jpg, /uploads/blog/*.jpg, /uploads/datasheets/*.pdf
export const Route = createFileRoute('/uploads/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const [folder, name, ...rest] = (params._splat ?? '').split('/');
        if (!folder || !isUploadFolder(folder) || !name || rest.length) return new Response('Not found', { status: 404 });
        const file = await readUpload(folder, decodeURIComponent(name));
        if (!file) return new Response('Not found', { status: 404 });
        const headers: Record<string, string> = { 'content-type': file.type, 'cache-control': 'public, max-age=86400', 'x-content-type-options': 'nosniff' };
        if (folder === 'datasheets') headers['content-disposition'] = `inline; filename="${name}"`;
        return new Response(new Uint8Array(file.body), { headers });
      },
    },
  },
});
