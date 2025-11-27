## JJ Stack (Nuxt + Hono)

This repo has been rebooted to use a Nuxt front-end (`apps/web`) and a Hono TypeScript API (`apps/api`).  
The previous Next.js/Prisma implementation still lives in `old/` for reference while we re-implement features.

### Structure
- `apps/web` – Nuxt 4 client app (SSR ready). Run with `npm run dev:web`.
- `apps/api` – Hono (Node template). Run with `npm run dev:api`.
- `old/` – Archived Next.js project if you need to copy logic/UI during the migration.
- `tsconfig.base.json` – shared compiler options for both workspaces.

### Getting Started
```bash
npm install          # installs workspace deps (+ nuxt prepare hook)
npm run dev          # runs web + api in parallel
```

Use `npm run build` to build both apps. You can also run scripts per workspace via `npm run <script> --workspace apps/web`.

### Environment variables

Create a `.env` at the repo root (or use PM2 ecosystem env) with at least:

```
MONGODB_URI="mongodb://localhost:27017"
MONGODB_DB="jj-core"
AUTH_SECRET="super-secret-string"
```

Each API feature defines its own collection helpers under `apps/api/src/features/*/db.ts`, so the migration script from Postgres → Mongo pourra s’appuyer dessus.

> Tip: When you port code from `old/`, keep it read-only and re-create files in the new apps so we can iteratively modernize the stack.

