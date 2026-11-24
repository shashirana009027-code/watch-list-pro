# Watchlist

A responsive movie collection app built with Next.js Pages Router, JavaScript, Bootstrap 5, MongoDB Atlas, Mongoose, and TMDB. The backend follows an MVC layout: API routes dispatch to controllers, controllers use models and services, and React pages/components provide the views.

## Run locally

1. Install Node.js 20.9 or newer.
2. Create a root `.env` file and fill in the values below for local development.
3. Install dependencies with `npm install`.
4. Start the development server with `npm run dev`, then open `http://localhost:3000`.

MongoDB Atlas must allow network access from your development machine and the database user must have read/write access. TMDB uses a server-side read access token (or an API key fallback). Never prefix server credentials with `NEXT_PUBLIC_`.

## Environment

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `TMDB_READ_ACCESS_TOKEN` | TMDB API read access token (recommended) |
| `TMDB_API_KEY` | Optional TMDB API key fallback |
| `JWT_SECRET` | Random secret used to sign seven-day sessions |
| `MONGODB_DNS_SERVERS` | Optional comma-separated DNS server IPs, only if custom DNS is needed |

`.env` is ignored by Git. Never commit it. Generate a session secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

## Features

- Registration and login with bcrypt password hashing and HTTP-only, SameSite=Lax JWT cookies.
- User-private watchlists with duplicate prevention, status, notes, rating, search, and movie details.
- Server-side TMDB search and detail lookups; imports include genres and release data.
- JPEG, PNG, and WEBP custom poster uploads up to 2 MB.
- Responsive dark dashboard with collection counts, discovery, filtering, empty states, and notifications.

## API

All errors use `{ "success": false, "message": "..." }`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current account |
| GET | `/api/tmdb/search?query=...&page=1` | Search TMDB |
| GET | `/api/tmdb/latest?page=1` | Current theatrical releases from TMDB |
| GET | `/api/tmdb/movie/:tmdbId` | TMDB details |
| GET/POST | `/api/watchlist` | List or import movies |
| GET/PUT/DELETE | `/api/watchlist/:id` | Read, update, or delete a saved movie |
| PATCH | `/api/watchlist/:id/poster` | Upload a custom poster (`poster` form field) |

Movie status is `to_watch`, `watching`, or `done`. Ratings are whole numbers 1–10 and are accepted only for completed movies. Notes are limited to 500 characters.

## Deployment

Deploy as a Next.js project on Vercel. Configure `MONGODB_URI`, `JWT_SECRET`, and either `TMDB_READ_ACCESS_TOKEN` or `TMDB_API_KEY` in the Vercel project settings for Preview and Production. Add the Vercel deployment origin or an appropriate network rule to MongoDB Atlas. Redeploy after changing environment variables.

Custom uploads use a local `uploads/` directory in normal Node deployments. On Vercel, they use `os.tmpdir()` and are exposed through `/api/posters/:filename`. Vercel's temporary filesystem is not persistent: uploaded files can disappear after an instance is recycled and are not shared between instances. Use object storage for durable production uploads.

## Structure

`config/` contains the cached database connection; `models/` the Mongoose schemas; `controllers/` request-level business logic; `services/` authentication and TMDB access; `middlewares/` authentication and upload handling; `pages/api/` route handlers; `pages/` and `components/` the UI; `styles/` the Bootstrap 5 theme overrides.
