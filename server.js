const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

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

const rootDir = __dirname;
const assetsDir = path.join(rootDir, "dist", "client", "assets");
const builtIndexPath = path.join(rootDir, "dist", "client", "index.html");

function getAssetFiles(pattern) {
  if (!fs.existsSync(assetsDir)) {
    return [];
  }

  return fs.readdirSync(assetsDir).filter((file) => pattern.test(file)).sort();
}

function findBootstrapScript() {
  const candidates = getAssetFiles(/^index-.*\.js$/);

  for (const file of candidates) {
    const filePath = path.join(assetsDir, file);
    const contents = fs.readFileSync(filePath, "utf8");
    if (contents.includes("hydrateRoot(document")) {
      return file;
    }
  }

  return candidates[0] ?? null;
}

function findStylesheet() {
  return getAssetFiles(/^styles-.*\.css$/)[0] ?? null;
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

function buildFallbackHtml() {
  const stylesheet = findStylesheet();
  const bootstrapScript = findBootstrapScript();

  if (!stylesheet || !bootstrapScript) {
    return null;
  }

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

function serveHtml(res) {
  if (fs.existsSync(builtIndexPath)) {
    serveFile(res, builtIndexPath);
    return;
  }

  const html = buildFallbackHtml();

  if (!html) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Build output not found. Run `npm run build` first.");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

const server = http.createServer((req, res) => {
  try {
    const requestUrl = new URL(req.url ?? "/", "http://localhost");
    const requestPath = decodeURIComponent(requestUrl.pathname);

    if (requestPath.startsWith("/assets/")) {
      const assetPath = path.join(rootDir, "dist", "client", requestPath);
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

    serveHtml(res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Hostel Hub Pro web app listening on http://${HOST}:${PORT}`);
});
