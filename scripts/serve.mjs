/**
 * Servidor estático para os exemplos WAI-ARIA e o dist/ da lib.
 *
 * Node puro (sem vite, sem python, sem deps) — serve a raiz do repo com MIME
 * correto para ESM (.mjs/.js), para você abrir os exemplos localmente sem WSL
 * e sem a resolução de bare specifiers do vite (caminho real do import map).
 *
 * Uso: `node scripts/serve.mjs [porta]` → default 4173
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2]) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ts': 'text/plain; charset=utf-8',
  '.d.ts': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let rel = decodeURIComponent(url.pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const abs = path.normalize(path.join(ROOT, rel));
    // não deixa escapar da raiz
    if (!abs.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('403');
      return;
    }
    const info = await stat(abs);
    if (info.isDirectory()) rel += '/index.html';
    const file = info.isDirectory() ? path.join(abs, 'index.html') : abs;
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404');
  }
}).listen(PORT, () => {
  console.log(`[serve] ${ROOT}`);
  console.log(`[serve] http://172.27.192.185:${PORT}/examples/wai-aria/`);
});
