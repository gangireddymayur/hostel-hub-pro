# Plesk Deployment

This repo is ready to deploy as a Node.js app in Plesk.

## Build

Run:

```powershell
npm install
npm run build
```

Important:

- Plesk can run this app on Node `18.20.6`.
- Build the app before deployment, then push the generated `dist/` folder with the repo.
- Do not point Plesk at the compiled `dist/server/server.js` file directly. Use the root `app.cjs` bootstrap instead.
- In Plesk, install runtime dependencies only. Use `NODE_ENV=production` or `npm install --omit=dev` so Vite/esbuild dev tooling is not installed on the server.

## Start

Plesk should start the app with:

```powershell
npm run start
```

That runs:

```powershell
node app.cjs
```

## Environment variables

Set this in Plesk:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

For local testing, you can use:

```env
VITE_API_URL=http://localhost:4000/api
```

## Important

- This repo is only the web portal.
- It supports `SUPER_ADMIN` and `HOSTEL_ADMIN`.
- The backend must be deployed separately and must be running before login works.
- The app does not need Plesk to rebuild the frontend or server bundle.
