# Plesk Deployment

This repo runs as a Node.js app under Plesk's built-in Node.js manager
(Passenger), not under IIS/iisnode. Do **not** add a `web.config` — Plesk's
Node runner and iisnode will fight each other and you'll get
`HRESULT: 0x2, HTTP 500.1001` with empty stderr.

## 1. Build locally before uploading

Plesk should not rebuild the frontend. Build on your machine, then upload
the result together with the source.

```powershell
npm install
npm run build
```

This produces a `dist/` directory. **Upload `dist/` along with the rest of
the repo.** If `dist/client/` is missing on the server, the app returns
500 with the message "Build output not found".

## 2. Install production dependencies on the server

In Plesk → Node.js panel, click **NPM install**. Make sure the app mode is
`production` so dev tooling (Vite, esbuild) is skipped.

If you prefer the shell:

```powershell
npm install --omit=dev
```

## 3. Plesk Node.js settings

Configure the panel exactly like this:

| Field                  | Value                                |
| ---------------------- | ------------------------------------ |
| Node.js Version        | 18.20.6 (or newer 18.x / 20.x)       |
| Package Manager        | npm                                  |
| Application Mode       | production                           |
| Application Startup File | `server.js`                        |

`server.js` simply does `require("./app.cjs")` — a plain Node HTTP server
that serves the prebuilt `dist/client/` files and proxies `/api/*` to your
backend. No Vite, no SSR, no native modules.

## 4. Environment variables

Set in Plesk → Node.js → "Custom environment variables":

```env
API_BASE_URL=https://api.yourdomain.com/api
```

(`VITE_API_URL` is also accepted as a fallback name.)

For local testing:

```env
API_BASE_URL=http://localhost:4000/api
```

## 5. Start / restart

After uploading or changing env vars, click **Restart App** in the Plesk
Node.js panel. That's it — no IIS handler, no `web.config`, no iisnode.

## Troubleshooting

- **`iisnode encountered an error... HRESULT: 0x2`** — a `web.config` is
  present and forcing IIS to use iisnode. Delete `web.config` from the
  application root and restart the app.
- **"Build output not found"** — you didn't upload `dist/client/`. Rebuild
  locally and upload it.
- **`/api/*` returns 503 "API_BASE_URL is not configured"** — set the
  `API_BASE_URL` env var in the Plesk Node.js panel and restart.
- **Backend not reachable** — this repo is the web portal only
  (`SUPER_ADMIN`, `HOSTEL_ADMIN`). Your separate backend must be deployed
  and reachable at `API_BASE_URL` before login works.
