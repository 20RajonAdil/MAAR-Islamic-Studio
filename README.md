# MAAR Islamic Studio

Islamic-only video platform. Videos come only from the approved channels in `lib/config.ts`.

## Deploy on Vercel
1. Import this repo in Vercel.
2. Add the environment variable `YOUTUBE_API_KEY` (YouTube Data API v3 key).
3. Deploy. The key stays on the server and is never sent to the browser.

## Edit the whitelist
Change `CHANNELS`, `BLOCK` and `TOPICS` in `lib/config.ts`.

## Local run
`cp .env.example .env.local`, add your key, then `npm install && npm run dev`.

## Google sign-in
Add `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` in Vercel. Redirect URI: `https://maarislamicstudio.vercel.app/api/auth/callback/google`.
