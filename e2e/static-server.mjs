// Serves the `next build` export in out/. `next start` does nothing for
// output: "export", and a dependency for 25 lines of node:http is not worth it.
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";

const ROOT = new URL("../out/", import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? process.argv[2] ?? 4321);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
};

/** Resolve a request path to a file, folding a directory onto its index.html. */
function resolve(pathname) {
  // normalize() collapses any ../ before it can escape the export root.
  const candidate = join(ROOT, normalize(decodeURIComponent(pathname)));
  if (!candidate.startsWith(ROOT)) return null;
  for (const file of [candidate, join(candidate, "index.html"), `${candidate}.html`]) {
    try {
      if (statSync(file).isFile()) return file;
    } catch {}
  }
  return null;
}

createServer((request, response) => {
  const { pathname } = new URL(request.url, "http://localhost");
  const hit = resolve(pathname);
  const file = hit ?? resolve("/404.html");
  if (!file) return response.writeHead(404).end("Not found");
  response.writeHead(hit ? 200 : 404, {
    "content-type": TYPES[extname(file)] ?? "application/octet-stream",
    "accept-ranges": "none",
  });
  createReadStream(file).pipe(response);
}).listen(PORT, () => console.log(`serving out/ on http://localhost:${PORT}`));
