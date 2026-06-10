# Steakz Restaurant MIS System

Enterprise-grade Restaurant Management Information System for Steakz.

## Architecture
- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL + JWT
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Testing: Jest + Supertest

## Setup

### Backend
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and configure `DATABASE_URL` and `JWT_SECRET`
4. `npx prisma generate`
5. `npx prisma migrate dev --name init`
6. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Notes
- The backend follows MVC architecture with separate `routes`, `controllers`, `services`, and `middleware`.
- Role-based access control is enforced via JWT and role middleware.
- API responses follow the specified success/error standard.

## Deployment
- `backend` is prepared for Render with `backend/package.json` build/start scripts.
- `frontend` is ready for Vercel; set `VITE_API_URL` to the deployed Render backend URL.
- Use `render.yaml` to define Render service settings and `frontend/vercel.json` for Vercel SPA routing.
