# Plesk Deployment (split build — works on Node 18)

This deploy avoids the "Node 20+" problem by **building locally** and only
uploading static files + a tiny Node server to Plesk. Plesk never runs Vite,
Tailwind, or TanStack — it just serves `dist/client/` and proxies `/api/*`.

## What goes on Plesk

You only upload these to the application root:

```
dist/                ← built locally (npm run build)
app.cjs              ← plain Node HTTP server, zero npm deps
plesk-package.json   ← rename to package.json on the server
web.config           ← iisnode handler (Plesk on Windows/IIS)
.env (optional)      ← if you want to set API_BASE_URL in a file
```

That's it. No `node_modules`, no `src/`, no Vite config.

## Step-by-step

### 1. Build on your PC (one-time tooling install)

You need Node 20.x or 22.x on your local machine (only for the build).
Get it from https://nodejs.org → LTS.

```powershell
npm install
npm run build
```

This produces `dist/client/` (static frontend) and `dist/server/` (ignored
by `app.cjs` — we don't use SSR on Plesk).

### 2. Prepare upload bundle

Copy these into a fresh folder and upload it to Plesk:

| Source in repo         | Upload as              |
| ---------------------- | ---------------------- |
| `dist/`                | `dist/`                |
| `app.cjs`              | `app.cjs`              |
| `plesk-package.json`   | `package.json`         |
| `web.config`           | `web.config`           |

### 3. Plesk Node.js panel

| Field                    | Value           |
| ------------------------ | --------------- |
| Node.js Version          | 18.20.6 is OK   |
| Application Mode         | production      |
| Application Startup File | `app.cjs`       |

Add environment variable:

```env
API_BASE_URL=https://your-backend.example.com/api
```

(Use `VITE_API_URL` instead if you prefer — both are accepted.)

### 4. Install + start

In the Plesk Node.js panel:

1. Click **NPM install** — installs nothing (deps list is empty), takes 1 second.
2. Click **Restart App**.

Done. The site is live.

## Updating the app later

1. Run `npm run build` locally.
2. Upload the new `dist/` folder (overwrite).
3. Click **Restart App** in Plesk.

If you change `app.cjs` itself, upload it too and **Restart App**.

## Why this works on Node 18

- Vite 7 / TanStack / Tailwind 4 only need Node 20+ to **build**.
- The build output in `dist/client/` is plain HTML/JS/CSS — any Node version can serve it.
- `app.cjs` is hand-written CommonJS using only Node built-ins (`http`, `fs`, `path`, `stream`) — fully Node 18-compatible.

## Troubleshooting

- **"Build output not found"** in the browser — you forgot to upload `dist/`.
- **`/api/*` returns 503 "API_BASE_URL is not configured"** — set `API_BASE_URL` in the Plesk env vars and **Restart App**.
- **iisnode 500.1001 / HRESULT 0x2** — the `web.config` handler path doesn't match the startup file. Confirm both point to `app.cjs`.
- **Backend errors after login** — this repo is the web portal only. Your backend (Super Admin / Hostel Admin API) must be deployed separately and reachable at `API_BASE_URL`.
