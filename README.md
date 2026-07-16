# ClearLane

ClearLane is a Vite + React + TypeScript app.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

If you do not provide Supabase environment variables, the app starts in a safe local demo mode that stores sign-in and onboarding data in your browser. Use throwaway credentials in demo mode rather than a real password.

## Optional Supabase setup

Copy the example environment file and fill in your real values:

```bash
cp .env.example .env.local
```

Required variables for Supabase-backed mode:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_ACCESS_TOKEN=
VITE_SCHEMA_NAME=
```

Then restart the dev server:

```bash
npm run dev
```

## Verify a production build

```bash
npm run build
```
