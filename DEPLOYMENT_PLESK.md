# Plesk Deployment — One-Click Style

You do **not** need to build locally. Plesk can install dependencies and
build the app in one step.

## ⚠️ Important: don't add `web.config`

Plesk's Node.js panel uses its own Node runner. If a `web.config` is also
present, IIS/iisnode hijacks the request and you get:

```
iisnode encountered an error... HRESULT: 0x2
HTTP status: 500   subStatus: 1001
```

This repo ships **without** `web.config` on purpose. Don't add one back.

## First-time setup (do this once)

In the Plesk Node.js panel for your domain, set:

| Field                    | Value          |
| ------------------------ | -------------- |
| Node.js Version          | 18.20.6 (or newer 18.x / 20.x) |
| Package Manager          | npm            |
| Application Mode         | `development`  ← **important** |
| Application Startup File | `server.js`    |

Why `development` mode? Plesk's `production` mode runs
`npm install --omit=dev`, which would skip Vite — and Vite is what builds
the frontend. `development` mode installs everything, then the
`postinstall` script builds. After build, only `node server.js` runs in
production — Vite is never invoked at runtime, so there's no performance
cost.

Then add these **Custom environment variables**:

```env
PLESK_BUILD=1
NODE_ENV=production
API_BASE_URL=https://your-backend.example.com/api
```

- `PLESK_BUILD=1` tells `postinstall` to build automatically.
- `API_BASE_URL` must point to your separately-deployed backend.

## Deploy (every time)

1. Upload the repo to your application root (no `dist/`, no `node_modules` needed).
2. In the Plesk Node.js panel, click **NPM install**.
   This installs deps **and** builds the frontend in one go.
3. Click **Restart App**.

That's it. Two clicks per deploy.

## Updating the app later

1. Upload the new code.
2. Click **NPM install** → **Restart App**.

If you only changed env vars, **Restart App** alone is enough.

## Troubleshooting

- **`HRESULT: 0x2` / `subStatus: 1001`** — a `web.config` snuck back in.
  Delete it and restart.
- **"Build output not found"** in the browser — the build didn't run.
  Confirm `PLESK_BUILD=1` is set in Plesk env vars and Application Mode is
  `development`, then click **NPM install** again.
- **`/api/*` returns 503 "API_BASE_URL is not configured"** — set
  `API_BASE_URL` in Plesk env vars and **Restart App**.
- **Login doesn't work** — this repo is the web portal only
  (`SUPER_ADMIN`, `HOSTEL_ADMIN`). Your backend must be deployed
  separately and reachable at the `API_BASE_URL` you configured.
- **NPM install fails on the server** — open Plesk's "Run NPM commands"
  tab and run `npm install` manually to see the full error.

## Manual fallback (if NPM install on Plesk fails)

Open the Plesk Node.js panel → **Run script** → type `build` and run it.
Then **Restart App**. This forces the build step without re-running
install.
