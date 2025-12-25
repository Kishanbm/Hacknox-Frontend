
# HackonxDesigns (Frontend)

HackonxDesigns hackathon platform (Vite + React + TypeScript).

Short: UI for participants, judges, and admins. Built with Vite and Tailwind.

Prerequisites
- Node.js 18+ and npm or pnpm

Quick start
- Install dependencies:

	npm install

- Run development server:

	npm run dev

- Build for production:

	npm run build

- Preview the production build:

	npm run preview

Environment
- Frontend may use `VITE_PUBLIC_URL` or `VITE_FRONTEND_URL` for absolute links in some flows. For local dev this is optional; set `VITE_PUBLIC_URL` to your deployed frontend domain in production.

Deploy
- Ideal: Vercel for frontend. Set the same env var `VITE_PUBLIC_URL` (or `VITE_FRONTEND_URL`) in Vercel settings.

Notes
- This README is intentionally minimal. See `src/` and `components/` for UI details.


