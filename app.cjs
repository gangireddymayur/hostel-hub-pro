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
const distServerDir = path.join(__dirname, "dist", "server");
const distServerPackageJson = path.join(distServerDir, "package.json");

function ensureDistServerIsEsm() {
  if (!fs.existsSync(distServerDir)) {
    return;
  }

  const desired = JSON.stringify({ type: "module" }, null, 2) + "\n";

  try {
    const current = fs.existsSync(distServerPackageJson)
      ? fs.readFileSync(distServerPackageJson, "utf8")
      : null;

    if (current !== desired) {
      fs.writeFileSync(distServerPackageJson, desired, "utf8");
    }
  } catch (error) {
    console.error("Failed to prepare dist/server as an ES module scope:", error);
  }
}

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

function toRequestUrl(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto ?? "http";
  const host = req.headers.host ?? `localhost:${PORT}`;
  return `${protocol}://${host}${req.url ?? "/"}`;
}

async function readRequestBody(req) {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  const chunks = [];
  for await (const chunk of req) {
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
    } else if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk));
    } else if (chunk instanceof Uint8Array) {
      chunks.push(Buffer.from(chunk));
    }
  }

  if (chunks.length === 0) {
    return undefined;
  }

  return Buffer.concat(chunks);
}

function copyHeaders(sourceHeaders) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(sourceHeaders)) {
    if (value == null) {
      continue;
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
      continue;
    }

    headers.set(key, value);
  }

  return headers;
}

(async () => {
  ensureDistServerIsEsm();
  const { default: server } = await import("./dist/server/server.js");

  const nodeServer = http.createServer(async (req, res) => {
    try {
      const body = await readRequestBody(req);
      const request = new Request(toRequestUrl(req), {
        method: req.method,
        headers: copyHeaders(req.headers),
        body,
      });

      const response = await server.fetch(request, undefined, undefined);
      res.writeHead(
        response.status,
        Object.fromEntries(response.headers.entries()),
      );

      if (req.method === "HEAD" || response.body == null) {
        res.end();
        return;
      }

      const readable = Readable.fromWeb(response.body);
      readable.on("error", (error) => {
        console.error(error);
        if (!res.headersSent) {
          res.statusCode = 500;
        }
        res.end();
      });
      readable.pipe(res);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("content-type", "text/plain; charset=utf-8");
      }
      res.end("Internal Server Error");
    }
  });

  nodeServer.listen(PORT, HOST, () => {
    console.log(`Hostel hub web app listening on http://${HOST}:${PORT}`);
  });
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
