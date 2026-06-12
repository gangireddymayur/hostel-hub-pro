const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { Readable } = require("node:stream");

process.noDeprecation = true;

function parsePort(value) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed < 65536 ? parsed : undefined;
}

const PORT =
  parsePort(process.env.PORT) ??
  parsePort(process.env.NODE_PORT) ??
  parsePort(process.env.IISNODE_PORT) ??
  3000;
const HOST = process.env.HOST ?? "0.0.0.0";
const API_BASE_URL = process.env.API_BASE_URL ?? process.env.VITE_API_URL ?? "";

const ROOT = __dirname;
const CLIENT_DIR = path.join(ROOT, "dist", "client");
const CLIENT_ASSETS = path.join(CLIENT_DIR, "assets");
const INDEX_FILE = path.join(CLIENT_DIR, "index.html");

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

function requestUrl(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto ?? "http";
  const host = req.headers.host ?? `localhost:${PORT}`;
  return new URL(req.url ?? "/", `${protocol}://${host}`);
}

async function readRequestBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return undefined;

  const chunks = [];
  for await (const chunk of req) {
    if (Buffer.isBuffer(chunk)) chunks.push(chunk);
    else if (typeof chunk === "string") chunks.push(Buffer.from(chunk));
    else if (chunk instanceof Uint8Array) chunks.push(Buffer.from(chunk));
  }

  return chunks.length ? Buffer.concat(chunks) : undefined;
}

function contentType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".html":
      return "text/html; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".ico":
      return "image/x-icon";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

function listAssets(pattern) {
  if (!fs.existsSync(CLIENT_ASSETS)) return [];
  return fs.readdirSync(CLIENT_ASSETS).filter((file) => pattern.test(file)).sort();
}

function findBootstrapScript() {
  const candidates = listAssets(/^index-.*\.js$/);
  for (const file of candidates) {
    const filePath = path.join(CLIENT_ASSETS, file);
    const contents = fs.readFileSync(filePath, "utf8");
    if (contents.includes("hydrateRoot(document")) return file;
  }
  return candidates[0] ?? null;
}

function findStylesheet() {
  return listAssets(/^styles-.*\.css$/)[0] ?? null;
}

function buildHtml() {
  const stylesheet = findStylesheet();
  const bootstrapScript = findBootstrapScript();
  if (!stylesheet || !bootstrapScript) return null;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hostel Hub Pro</title>
    <meta name="description" content="Hostel leave management system" />
    <link rel="stylesheet" href="/assets/${stylesheet}" />
    <script type="module" src="/assets/${bootstrapScript}"></script>
  </head>
  <body>
    <noscript>You need JavaScript enabled to use this application.</noscript>
  </body>
</html>`;
}

function serveFile(res, filePath) {
  const stream = fs.createReadStream(filePath);
  res.writeHead(200, {
    "Content-Type": contentType(filePath),
    "Cache-Control": filePath.includes(`${path.sep}assets${path.sep}`)
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  });

  stream.on("error", (error) => {
    console.error(error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end("Internal Server Error");
  });

  stream.pipe(res);
}

async function proxyApi(req, res) {
  if (!API_BASE_URL) {
    res.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        error: "API_BASE_URL is not configured",
        message: "Set API_BASE_URL or VITE_API_URL in Plesk to point to your backend.",
      }),
    );
    return;
  }

  const upstreamUrl = new URL(req.url ?? "/", API_BASE_URL);
  const body = await readRequestBody(req);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    const lower = key.toLowerCase();
    if (["host", "connection", "content-length", "transfer-encoding"].includes(lower)) continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }

  const response = await fetch(upstreamUrl, {
    method: req.method,
    headers,
    body,
  });

  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));

  if (req.method === "HEAD" || !response.body) {
    res.end();
    return;
  }

  Readable.fromWeb(response.body).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    const requestPath = decodeURIComponent(requestUrl(req).pathname);

    if (requestPath.startsWith("/api")) {
      proxyApi(req, res).catch((error) => {
        console.error(error);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        }
        res.end("Internal Server Error");
      });
      return;
    }

    if (requestPath.startsWith("/assets/")) {
      const assetPath = path.join(CLIENT_DIR, requestPath);
      if (fs.existsSync(assetPath) && fs.statSync(assetPath).isFile()) {
        serveFile(res, assetPath);
        return;
      }
    }

    if (req.method === "HEAD") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end();
      return;
    }

    if (fs.existsSync(INDEX_FILE)) {
      serveFile(res, INDEX_FILE);
      return;
    }

    const html = buildHtml();
    if (html) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Build output not found. Run `npm run build` before deploying to Plesk.");
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Hostel hub web app listening on http://${HOST}:${PORT}`);
});
