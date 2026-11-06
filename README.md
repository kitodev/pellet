# Pellet Centrum

Two apps in one folder, sharing one **MySQL** database and one `uploads/` folder:

| Folder   | What                              | Stack                          | Run                                   |
|----------|-----------------------------------|--------------------------------|---------------------------------------|
| `/`      | Public website (+ old admin at `/auth`) | TanStack Start + Vite (pnpm) | `pnpm install` → `pnpm dev` (:8080) |
| `admin/` | Admin backend (products, texts)   | Next.js 16 App Router (npm)    | `npm install` → `npm run dev` (:3001) |

## First-time setup (XAMPP)

1. Start **MySQL** in the XAMPP Control Panel.
2. (Optional) phpMyAdmin → Import → `database/schema.sql` creates the empty `pellet` database – `pnpm db:migrate` does it too.
3. Install packages: `pnpm install` (root) and `npm install` (in `admin/`).
4. Create / update the tables: `pnpm db:migrate` (run again after every update – it only applies new steps)
5. Copy the data from Supabase (texts, products, images → `uploads/products`), once:
   `pnpm db:migrate-data`
6. Create an admin user: `pnpm db:create-admin you@example.com YourPassword`

Settings: `.env` (website + scripts) and `admin/.env.local` (admin):
`DATABASE_URL=mysql://root:@127.0.0.1:3306/pellet`, `UPLOADS_DIR`.
For a hosted MySQL, only `DATABASE_URL` changes.

## Database (`database/`)

- `migrate.mjs` + `migrations/` – tables: `users`, `user_roles`, `sessions`, `site_texts`, `products`, `product_images`, `reviews`, `blog_posts` (`pnpm db:migrate`)
- `seed/blog/*.md` – the Tudástár article drafts (loaded once as drafts)
- `schema.sql` – only creates the database
- `migrate-from-supabase.mjs` – one-time copy from the old Supabase project
- `create-admin.mjs` – create an admin / reset a password
- `supabase-legacy/` – the old Postgres migrations, for reference only

## Menu structure

Kezdőlap · Termékek · Szolgáltatások · Biomassza · Tudástár · Rólunk · Kapcsolat · Árajánlatkérés
(structure from "Pelletcentrum weboldal váz.xlsx", 2026-11)

- Termékek: area (Tüzelőanyagok / Takarmányok / Fűtési megoldások) → section (tile, e.g. Fűtő pelletek)
  → category (e.g. A1 fapellet; products belong here). Biomassza kazánok has a third level (`subgroup`:
  Lakossági / Ipari / Nagyipari). On a category page products are grouped by the *Gyártó* spec if set.
- Old URLs (/kalyhak-kandallok, /kiegeszitok, /futoanyagok/fa-pellet, …) redirect (301) – `renamedCategories`;
  migration 006 moves the existing products (products of removed categories are hidden – check them in the admin).
- `/termekek` – every product category as a tile, grouped by area (`ProductsOverview.tsx`).
- Árajánlatkérés + Kazánkalkulátor are always on screen: header buttons, a tab on the right edge (desktop),
  a bar at the bottom (mobile) – `FloatingActions` in `SiteChrome.tsx`.
- Slides: admin → *Slide-ok* tab (table `slides`, migration 005, images in `uploads/slides`).
  Home page: the slides replace the default hero; Termékek page: shown above the tiles.
- Colours: light theme block at the end of `src/styles.css` (ecocomfort.hu greens/graphite on white).

- The product menus and their submenus (categories) and the technical data shown per menu are defined in
  `src/lib/content/catalog.ts` (copy: `admin/lib/content/menu.ts` – keep them identical).
- URLs: `/futoanyagok` → `/futoanyagok/futo-pelletek` → `/futoanyagok/a1-fapellet/<termek>` (3 clicks from the home page).
- Old URLs (`/biomassza/...`, `/takarmany/...`, `/szerviz`, `/miert-minket`) redirect permanently (301) to the new pages.
- SEO: `/sitemap.xml` (set `SITE_URL=https://www.your-domain.hu` in `.env` for production), JSON-LD for products,
  articles, breadcrumbs and the business; `public/robots.txt` (add your sitemap URL there).
- Admin-editable texts: after adding `<Text id="...">` to a page run `pnpm texts` to refresh the list in both apps.

## Website structure (`src/`)

```
src/
├── routes/                 ← routing only (TanStack file routes; thin pages)
│   └── uploads.$.ts        ← serves uploads/products/* images
├── components/
│   ├── ui/                 ← primitives (shadcn/ui)
│   ├── features/           ← domain components: catalog, calculator, quote, content, admin
│   └── layouts/            ← SiteChrome (header, footer, page hero)
├── lib/
│   ├── actions/            ← server functions (createServerFn): content, auth
│   ├── db/server/          ← MySQL pool, queries, sessions, image storage (server-only)
│   ├── validations/        ← Zod schemas
│   ├── content/            ← catalog, default texts, content query + context
│   ├── errors/             ← SSR error capture + error page
│   └── utils/              ← pure helpers (cn, heating, seo)
├── hooks/                  ← client hooks (useContent, useMobile)
├── types/                  ← database.ts (MySQL row types), index.ts
├── assets/                 ← imported images
├── test/                   ← Vitest tests
├── router.tsx · start.ts · server.ts · styles.css
```

Dependency direction: `routes → components → lib`. `lib/` never imports from `components/` or `routes/`.
