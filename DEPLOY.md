Deployment checklist — Steakz MIS

Overview
- Frontend: Vercel (build: `npm run build`, output: `dist`)
- Backend: Render (Node web service)
- Database: Neon Postgres (set `DATABASE_URL` on Render)

Backend (Render)
1. Create a new Web Service in Render and connect your GitHub repo branch (e.g., `main`).
2. In Render service settings set:
   - Build Command: `npm ci && npm run build && npx prisma generate`
   - Start Command: `npm run start`
   - Environment: Node
3. Set environment variables on Render:
   - `DATABASE_URL` = (Neon pooled connection string)
   - `JWT_SECRET` = (secure secret)
   - `JWT_EXPIRES_IN` = `7d` (or as required)
   - `PORT` = `10000` (optional; Render assigns one)
   - `FRONTEND_URL` = (Vercel frontend URL)
   - `RUN_SEED` = `false` (only enable if you want seeds to run on first deploy)
4. Enable PR previews or manual deploys as needed.
5. For database migrations on Render, during build or as a separate job run:
   - `npx prisma migrate deploy`
   This applies migrations in `prisma/migrations` to the production DB.

Frontend (Vercel)
1. Import project in Vercel and point to the frontend folder as root.
2. Build & Output:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment variables for Vercel:
   - `VITE_API_URL` = `https://<your-render-backend-url>`
4. Deploy and obtain frontend URL.

Neon DB migration (safe approach)
1. Create Neon project and obtain pooled connection string.
2. Dump local DB schema + data:
   ```bash
   pg_dump -U <local_user> -h localhost -d <local_db> --clean --no-owner --no-privileges > steakz_dump.sql
   ```
3. Import to Neon (example):
   ```bash
   psql "postgresql://user:pass@host/neondb?sslmode=require" -f steakz_dump.sql
   ```
4. Update Render `DATABASE_URL` to Neon connection string and run `npx prisma migrate deploy` on Render (in build or manually via SSH/Jobs).

Notes & Troubleshooting
- Ensure `@prisma/client` is a runtime dependency (already updated).
- Render will run `npm ci` which installs the client and allows `prisma generate` to succeed.
- If seeds are destructive, keep `RUN_SEED=false` and run seeds manually once.
- For CORS, `FRONTEND_URL` is used to restrict origins; update it after frontend is live.

Commands to run locally before pushing
```bash
# Build backend and frontend locally to verify
npm --workspace backend run build
npm --workspace frontend run build
```
