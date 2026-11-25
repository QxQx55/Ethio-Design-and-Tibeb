# Ethio Design and Tibeb

An Ethiopian couture storefront built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui and Supabase.

## Features

- Curated product catalog with search, category/event filters, price range and sorting
- Shopping cart and quick product views
- Customer, staff and admin dashboards with Supabase auth and realtime updates
- Offline showcase: if the catalog cannot be reached, the shop displays a local sample collection with a retry option instead of an error screen

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on port 3000.

## Configuration

Copy `.env.example` to `.env.local` and point it at your own Supabase project:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The anon key is safe to expose in the browser; row-level security in Supabase controls what it can access. Without configuration, the app falls back to built-in demo credentials and, if those are unreachable, to the offline showcase data in `src/data.ts`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
├── components/       # UI, layout and shop components
├── constants/        # Editorial copy and asset references
├── context/          # Auth and cart providers
├── data.ts           # Local showcase data used as an offline fallback
├── lib/              # Supabase client and data helpers
├── pages/            # Storefront and dashboard routes
└── types.ts          # Shared domain types
public/               # Locally hosted logo and illustration assets
supabase/functions/   # Edge functions (checkout)
```
