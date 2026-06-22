# The Cutique — GBP Control Panel (Web Version)

A shared dashboard for content calendar, post/Q&A generator, ranking tracker,
and competitor tracking — hosted as a real website, not inside Claude.

Once deployed, you and your staff open the same link on any device/browser —
no Claude account needed, no login screen, just the link.

---

## Step 1 — Create your free database (Supabase)

1. Go to **https://supabase.com** → sign up (free) → "New project"
2. Pick any project name (e.g. `cutique-dashboard`) and a database password
   (save it somewhere — you won't need it day-to-day, just keep it safe)
3. Wait ~1 minute for the project to finish setting up

## Step 2 — Create the database tables

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase-setup.sql` (included in this folder), copy all of it,
   paste into the editor
4. Click **Run** — you should see "Success. No rows returned"

## Step 3 — Connect the app to your database

1. In Supabase, go to **Settings → API**
2. Copy the **Project URL**
3. Copy the **anon public** key (NOT the service_role key)
4. Open `src/supabaseClient.js` in this folder and paste both values in:

```js
const SUPABASE_URL = "https://xxxxxxxxxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

## Step 4 — Put this project on GitHub

1. Go to **https://github.com** → sign in (or create a free account)
2. Click **New repository** → name it `cutique-dashboard` → Create
3. Upload all the files in this folder to that repository
   (easiest way: on the repo page, click "uploading an existing file" and
   drag the whole folder in, or use GitHub Desktop if you prefer)

## Step 5 — Deploy on Vercel (free)

1. Go to **https://vercel.com** → sign up using your GitHub account
2. Click **Add New → Project**
3. Select your `cutique-dashboard` repository → Import
4. Leave all settings as default (Vercel auto-detects Vite) → click **Deploy**
5. Wait ~1 minute — you'll get a live link like:
   `https://cutique-dashboard.vercel.app`

That link is your shared dashboard. Bookmark it, share it with your staff member —
both of you can open it anytime, on any device, and see the same data.

---

## Updating the app later

If you ever want to change something (new treatment, new wording), just edit
the files and re-upload to GitHub — Vercel automatically redeploys within
about a minute of any update.

## A note on privacy

This app uses a private link with no password. Anyone who has the link can
view and edit the data. Don't post the link publicly — only share it with
people you trust, the same as you would a shared Google Doc link.

## Need a login screen later?

If down the road you want a password before the dashboard loads, that's a
small addition (Supabase has built-in authentication) — just ask and it can
be added.
