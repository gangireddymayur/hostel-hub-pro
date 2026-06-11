# Plesk Deployment

This repo is ready to deploy as a Node.js app in Plesk.

## Build

Run:

```powershell
npm install
npm run build
```

## Start

Plesk should start the app with:

```powershell
npm run start
```

That runs:

```powershell
node dist/server.js
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
