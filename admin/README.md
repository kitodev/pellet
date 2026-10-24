# Pellet Centrum – Admin (Next.js)

Admin backend for the Pellet Centrum website: products (prices, sale prices, technical data, photo gallery, PDF datasheets, featured/hidden), customer reviews, Tudástár articles, contact details and all site texts – stored in MySQL.

## Run

```bash
cd admin
npm install
npm run dev        # http://localhost:3001
npm run build && npm start   # production
```

Settings live in `.env.local` (template: `.env.example`): `DATABASE_URL` (MySQL), `UPLOADS_DIR` (files shared with the website: `../uploads`) and `NEXT_PUBLIC_SITE_URL` (website address for "view on site" links, default http://localhost:8080).

Database updates are applied from the project root with `pnpm db:migrate`.

## Project structure

```
admin/
├── app/                         ← routing only (thin pages, no business logic)
│   ├── (auth)/login/page.tsx    ← route group: sign-in
│   ├── (dashboard)/             ← route group: signed-in admin area
│   │   ├── layout.tsx           ← auth + admin-role gate, header
│   │   └── page.tsx             ← loads data, renders AdminTabs
│   ├── uploads/[folder]/[name]/route.ts ← previews of uploaded files (admins only)
│   ├── layout.tsx · loading.tsx · error.tsx · not-found.tsx
│   └── globals.css · fonts.css
├── components/
│   ├── ui/                      ← primitives (Button, StatusMessage) + index.ts barrel
│   ├── features/                ← domain components
│   │   ├── auth/  dashboard/  products/  reviews/  blog/  contact/  texts/
│   └── layouts/                 ← DashboardLayout, AuthLayout
├── lib/
│   ├── actions/                 ← Server Actions ("use server"): auth, products, texts
│   ├── auth/session.ts          ← getSession / requireUser / requireAdmin
│   ├── db/
│   │   ├── client.ts            ← MySQL pool (mysql2)
│   │   └── queries/             ← products, reviews, posts, texts, auth (all SQL lives here)
│   ├── storage/uploads.ts       ← save/delete product images on disk
│   ├── validations/             ← Zod schemas: auth, product, text
│   ├── content/                 ← catalog + default site texts
│   ├── utils/                   ← pure helpers (cn, toActionResult)
│   └── env.ts                   ← validated env vars
├── hooks/useAsyncAction.ts      ← client mutation state
├── types/                       ← database.ts (MySQL rows), api.ts (ActionResult), index.ts
├── public/{images,fonts}/       ← logo, self-hosted fonts
├── proxy.ts                     ← Next 16 proxy (ex-middleware): redirect to /login without session cookie
└── next.config.ts · tsconfig.json
```

Dependency direction: `app → components → lib`. Nothing in `lib/` imports from `components/` or `app/`.

## Access

- Sign in with an admin user stored in MySQL (`users` + `user_roles` tables, bcrypt passwords, sessions in `sessions`).
- Create / reset an admin from the project root: `pnpm db:create-admin you@example.com YourPassword`
- The session cookie (`pellet_session`) is shared with the website's built-in admin on localhost.
