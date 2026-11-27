# Dr. Pratap

Multilingual medical publishing site. Authentication is Clerk. The database is Neon PostgreSQL through Drizzle. Images are stored in Supabase Storage. Email is sent with Resend. The app is intended to run on Vercel.

## Local setup

```bash
copy .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Fill `.env` from the existing Clerk application, the Neon connection string, Supabase, and Resend. Do not create a second Clerk application.

In the Clerk dashboard, enable email and password, require email verification, and allow these application paths:

- `/en/login`, `/te/login`, `/hi/login`
- `/en/register`, `/te/register`, `/hi/register`
- `http://localhost:3000` for development
- the production domain after deployment

`npm run admin:create` sets `publicMetadata.role` to `admin` on the Clerk user whose email is `ADMIN_EMAIL`. That person must already have a Clerk account. The same address in `ADMIN_EMAIL` is also treated as an administrator when they sign in.

## Supabase

Create a public bucket named `media`. The server uploads and deletes objects with `SUPABASE_SERVICE_ROLE_KEY`. Readers load published images from the bucket's public URL. Do not put the service-role key in client code.

## Production

Set the same variable names in Vercel. Use the Neon pooled `DATABASE_URL` for the application and the Neon direct `DATABASE_URL_UNPOOLED` for migrations. Also set the Clerk, Resend, and Supabase variables from `.env.example`. Point `NEXT_PUBLIC_APP_URL` and the Clerk allowed origins at the production domain. Run `npm run db:migrate` against Neon before the first administrator sign-in. A local PostgreSQL server is not required.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The public site is `/en`. The dashboard is `/admin`.
