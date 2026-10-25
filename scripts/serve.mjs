import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve("dist");
const mount = "/pages-check/";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".zip": "application/zip",
  ".txt": "text/plain; charset=utf-8",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (!url.pathname.startsWith(mount)) {
        res.writeHead(404);
        return res.end("Not found");
      }
      const relative =
        decodeURIComponent(url.pathname.slice(mount.length)) || "index.html";
      const file = path.resolve(root, relative);
      if (!file.startsWith(root + path.sep)) {
        res.writeHead(403);
        return res.end("Forbidden");
      }
      if (!(await stat(file)).isFile()) throw Error();
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(4173, "127.0.0.1", () =>
    process.stdout.write("Local: http://127.0.0.1:4173/pages-check/\n"),
  );
