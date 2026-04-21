# orDough Bakery Workspace

## Overview

pnpm workspace monorepo using TypeScript. Full-stack artisan bakery application with a cinematic public website and a complete admin POS dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion
- **3D**: Three.js via @react-three/fiber + @react-three/drei (lazy-loaded with WebGL detection)

## Artifacts

### orDough (react-vite) — `/`
- **Public website**: Dark cinematic homepage with Three.js hero (WebGL with CSS fallback), menu cards, review marquee, about section
- **Admin dashboard**: Full POS with orders, menu, customers, ingredients, recipes, reviews, profit, settings, invoice pages
- Located at: `artifacts/ordough/`

### API Server (api) — `/api`
- Express 5 backend with PostgreSQL via Drizzle ORM
- Routes: menu, customers, orders, ingredients, recipes, reviews, settings, dashboard
- Located at: `artifacts/api-server/`

## Database Schema
Tables: `menu_items`, `customers`, `orders`, `ingredients`, `recipes`, `reviews`, `settings`

## Color Palette
- Espresso: #3A2119
- Chambray: #79A3C3
- Bisque: #EBCDB7
- Glacier: #D2E2EC
- Clay: #957662
- Cream: #FAF6F1
- Dark bg: #0a0402

## Fonts
- Headings: Cormorant Garamond (300 weight)
- Prices: Playfair Display (bold)
- Body: Inter

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
