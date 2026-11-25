# Ethio Design and Tibeb

An Ethiopian couture storefront built with React, TypeScript, Vite, Tailwind CSS and shadcn/ui, backed by a bundled Node.js + SQLite API.

## Features

- Curated product catalog with search, category/event filters, price range and sorting
- Shopping cart and quick product views
- Customer accounts, order history and checkout
- Staff and admin dashboards for orders, inventory, categories and image uploads
- Persistent data: accounts, sessions, products, orders and stock live in `backend/data/store.db`
- Offline showcase: if the API cannot be reached, the shop displays a local sample collection with a retry option instead of an error screen

## Getting started

```bash
npm install
npm run dev
```

`npm run dev` starts both processes:

- Storefront: http://localhost:5000
- API: http://localhost:3101 (proxied through `/api` and `/uploads`)

Port 5000 must be available before starting the storefront.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@ethiodesign.test` | `Admin123!` |
| Staff | `staff@ethiodesign.test` | `Staff123!` |
| Customer | `customer@ethiodesign.test` | `Customer123!` |

New accounts can also be created from the sign-in dialog. Passwords are salted and hashed with scrypt.

## Production

```bash
npm run build
npm start
```

`npm start` serves the built storefront and the API together on http://localhost:5000.

## Data and configuration

- SQLite database: `backend/data/store.db` (created and seeded on first run)
- Uploaded product images: `backend/uploads/`
- Optional environment overrides:
  - `API_PORT` — API port when running `node backend/index.js` directly (default `3101`)
  - `VITE_API_URL` — absolute API origin for a split frontend/API deployment (default: same origin)

Both `backend/data` and `backend/uploads` are git-ignored, so each checkout starts with a clean seeded catalog.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the storefront and the API together |
| `npm run dev:web` | Start only the Vite storefront |
| `npm run dev:api` | Start only the Node/SQLite API |
| `npm run build` | Type-check and build for production |
| `npm start` | Serve the production build and API together |
| `npm run preview` | Preview the production build with Vite |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run ESLint |

## Project structure

```
.
├── backend/
│   └── index.js              # HTTP API, auth and SQLite
├── frontend/
│   ├── public/               # Static assets and runway page
│   ├── src/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── data.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── types.ts
│   ├── design-preview.html
│   ├── index.html
│   └── vite.config.ts
└── supabase/
    └── functions/            # Legacy Stripe checkout edge function
```

The root `package.json` and TypeScript solution config orchestrate the frontend and backend.
