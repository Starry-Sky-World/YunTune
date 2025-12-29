# Repository Guidelines

## Project Structure & Module Organization

- `src/app/`: Next.js App Router routes and pages (e.g. `src/app/login/page.tsx`), plus BFF endpoints under `src/app/api/**/route.ts`.
- `src/components/`: UI and feature components (player, auth, shell, PWA helpers).
- `src/lib/`: Shared utilities (BFF helpers, session encryption/cookies, config/env, lyric parser).
- `src/store/`: Client state (Zustand), e.g. `src/store/player.ts`.
- `public/`: Static assets, including the service worker `public/sw.js`.
- `scripts/`: Local tooling, e.g. interactive config generator `scripts/config.mjs`.

## Build, Test, and Development Commands

- `npm run dev`: Start local dev server (webpack mode).
- `npm run build`: Production build (webpack mode).
- `npm run start`: Run production server after build.
- `npm run typecheck`: `tsc --noEmit` for strict TypeScript verification.
- `npm run lint`: ESLint (may require local setup depending on Next version).
- `npm run config`: Interactive helper to create/update `config.json`.

## Coding Style & Naming Conventions

- Language: TypeScript + React (App Router). Use functional components and hooks.
- Formatting: keep changes minimal; prefer existing patterns (Tailwind utility classes, `cn()` helper).
- Naming: `kebab-case` for route folders (`src/app/playlist/[id]`), `camelCase` for variables/functions, `PascalCase` for components.
- Avoid logging or returning sensitive data (especially upstream cookies).

## Testing Guidelines

- No dedicated test framework is set up yet.
- When adding tests, prefer lightweight unit tests colocated by feature (e.g. `src/lib/**`) and add a single `npm run test` script.

## Commit & Pull Request Guidelines

- Existing history uses short subject lines, e.g. `Feat: ...`. Keep a similar prefix style (`Feat:`, `Fix:`, `Chore:`) and describe the user-facing change.
- PRs should include: a clear description, steps to verify (`npm run typecheck` + `npm run build`), and screenshots/GIFs for UI changes.

## Security & Configuration Tips

- Prefer `config.json` (repo root) for local configuration; it is gitignored. Fallback is `.env.local` / Vercel env vars.
- Session is stored server-side in encrypted HttpOnly cookies and may be chunked (`__Host-yuntune_s1/s2...`). Do not store upstream cookies in `localStorage` or expose them to the browser.
