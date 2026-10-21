# Dependency upgrade, October 2026

Branch `chore/deps-upgrade`, based on main `ca97ed5`. Only patch/minor updates, Node 24 and TypeScript 6 in the backend. No schema change, no migration, no new package.

## What changed

| Package | Old | New | Where |
|---|---|---|---|
| Node (Docker image) | 20.20.2 (`node:20-alpine`) | 24.22.0 (`node:24-alpine`) | both Dockerfiles, `.nvmrc` |
| express | 5.2.1 | 5.3.0 | backend |
| proxy-addr (from express) | 2.0.7 | 2.0.8 | backend |
| zod | 4.4.3 | 4.6.7 | backend |
| tsx | 4.23.12 | 4.23.15 | backend |
| typescript | 5.9.3 | 6.0.3 | backend (frontend was already on 6.0.3) |
| @types/node | 24.19.0 | 24.19.2 | backend |
| react, react-dom | 19.2.8 | 19.3.1 | frontend |
| react-router-dom | 7.18.3 | 7.18.4 | frontend |
| vite | 8.3.0 | 8.3.4 | frontend |
| @vitejs/plugin-react | 6.0.5 | 6.1.2 | frontend |
| oxlint | 1.79.0 | 1.88.0 | frontend |
| @types/react | 19.2.18 | 19.3.0 | frontend |
| @types/react-dom | 19.2.4 | 19.3.0 | frontend |
| @types/node | 24.13.3 | 24.19.2 | frontend |
| source-map-js (from vite) | 1.2.1 | 1.2.2 | frontend |

Also:
- the empty `package-lock.json` at the repo root is removed and ignored. It came back a few times from running `npm` at the root. Run npm inside `backend/` or `frontend/` only.
- Prisma stays on 6.19.3 and Postgres stays on 15. Everything else was already on its latest version.

## After you pull

1. Switch to Node 24 on your machine:

```bash
nvm install 24   # first time only
nvm use          # reads .nvmrc
node -v          # v24.x
```

2. Reinstall packages in both folders:

```bash
git pull
cd backend && rm -rf node_modules && npm ci && npx prisma generate && cd ..
cd frontend && rm -rf node_modules && npm ci && cd ..
```

`npx prisma generate` needs `DATABASE_URL`, so run it with your `backend/.env` in place.

3. Rebuild the containers:

```bash
docker compose down
docker compose up -d --build
```

`make re` does the same thing.

Do not skip the `down`. Compose keeps `/app/node_modules` in an anonymous volume, and a plain `docker compose up -d --build` reuses the old one. Your container then keeps running the old packages even though the image is new. I checked it: after a plain `up --build`, the backend container still had proxy-addr 2.0.7 while the new image had 2.0.8. `down` then `up --build`, or `docker compose up -d --build -V`, both fix it.

**Do not use `docker compose down -v` or `make reset`.** They delete the `pgdata` volume, so you lose your local database. Plain `down` and `-V` keep it.

No migration is needed. The backend still runs `prisma migrate deploy` and the seed on start. There is nothing pending, and the seed is safe to run again.

To check that it worked:

```bash
docker compose exec backend node -v     # v24.22.0
docker compose exec backend node -p "require('express/package.json').version"   # 5.3.0
docker compose exec frontend node -p "require('vite/package.json').version"     # 8.3.4
```

## What you will notice while coding

- No renamed APIs and no new config files. TypeScript 6 needed no code change in the backend.
- npm 11 (comes with Node 24) prints `npm warn install-scripts 5 packages have install scripts not yet covered by allowScripts` in the backend. The scripts still run, it is only a warning unless `strict-allow-scripts` is turned on. Nothing to do.
- On Node 20, `npm install vite@...` in the frontend fails with `Cannot read properties of null (reading 'edgesOut')`. That is an npm 10 bug and it also happens on main. npm 11 does not have it, one more reason to switch to Node 24.
- oxlint 1.88 shows the same 13 warnings as before, no new rule fires.
- Express 5.3: `res.send()` no longer adds `Content-Length` when `Transfer-Encoding` is set, and it no longer throws on a `Content-Type` it cannot parse. Our code does not depend on either.
- React 19.3: transitions now render independently. We do not use transitions.
- After `down` or `-V`, the old anonymous `node_modules` volumes stay on disk. They only take space. `docker volume ls -f dangling=true` lists them.

## Deferred, and why

| Upgrade | Why not now |
|---|---|
| Prisma 7 (6.19.3 → 7.10.1) | Needs two new packages (`@prisma/adapter-pg`, `pg`), the new `prisma-client` generator with an output path, `url` moved out of `schema.prisma`, and new imports in 6 files (`lib/prisma.ts`, `auth/session.service.ts`, `seed.ts`, 3 seed-data files). `generate` and `seed` also stop running on their own. Too much before the evaluation. |
| TypeScript 7 | New native compiler. `tsc` passes with it on both packages today, but it brings nothing we need before November. |
| google-auth-library 11 | The only breaking change is Node 22+, so it is possible now. The Google login can only be checked by hand and the update brings us nothing. |
| dotenv 18 | Nothing we need. The "injected env" log moves to stderr. |
| @types/node 26 | Has to match the Node we run, which is 24. |
| Node 26 | Only becomes LTS on 28 October. Too new for 16 November. Node 24 is supported until April 2028. |
| Postgres 16+ | A major Postgres version cannot read the existing `pgdata` volume without a dump and restore on every machine. Postgres 15 is supported until November 2027. |

## deepmerge-ts advisory

`npm audit` in the backend still reports 3 high: `deepmerge-ts <8`, pulled in by `@prisma/config`, pulled in by `prisma`. Every Prisma 6 version is in the affected range. The only fix is Prisma 7.

deepmerge-ts only runs when the Prisma CLI loads our own `prisma.config.ts`. `@prisma/client` does not use it, so no HTTP request can reach it. We accept it until the Prisma 7 upgrade after the evaluation. We do not force deepmerge-ts 8 with npm `overrides`, because that is a major version under Prisma that nobody tested.

## Rolling back

- Each step is its own commit, so one step can be reverted alone with `git revert <commit>` on a branch and a PR.
- To undo everything after merge: `git revert -m 1 <merge commit>` on a branch, then a PR. No direct push to main.
- Locally after a rollback: `nvm use 20`, `rm -rf node_modules && npm ci` in both folders, then `docker compose down` and `docker compose up -d --build`. The upgrade does not touch the database, so your data stays.
