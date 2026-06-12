# Plesk Deployment

This project now runs the frontend and backend from the same Plesk Node app.
The UI is built locally, then Plesk serves `dist/client/` and handles `/api/*`
from `app.cjs`.

## What goes on Plesk

Upload these to the application root:

```text
dist/                built locally with `npm run build`
server.js            Node startup file (loads `app.cjs`)
plesk-package.json   rename to package.json on the server
web.config           iisnode handler for Windows/IIS
db/schema.sql        MySQL schema for the production database
```

You do not need to upload `src/` or `node_modules/` for the site to run.

## Build locally

Use Node 20+ on your PC for the build:

```powershell
npm install
npm run build
```

This produces `dist/client/` for the browser and `dist/server/` from TanStack.

## Plesk Node settings

Set these in the Plesk Node.js panel:

```text
Node.js Version          18.20.6 is OK
Application Mode         production
Application Startup File  server.js
```

Optional environment variable:

```env
JWT_SECRET=change-me-in-plesk-env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

If you want to check the DB from your machine:

```powershell
npm run db:check
```

## Install and start

1. Click **NPM install**.
2. Click **Restart App**.

## Default seeded logins

```text
Super admin
email: admin@hostelhub.local
password: Admin@12345

Hostel admin
email: hosteladmin@hostelhub.local
password: Hostel@12345
```

## Troubleshooting

- If the browser says build output is missing, upload `dist/` again.
- If login fails before the database is configured, set the DB env vars above
  or use the seeded local fallback data in `app.cjs`.
- If iisnode shows a 500.1001 error, confirm `web.config` points to `server.js`
  and the Node startup file is `server.js` in Plesk.
