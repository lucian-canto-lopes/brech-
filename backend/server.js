const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT, 'frontend');
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

function readJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro lendo JSON:', err.message);
    return null;
  }
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  let pathname = parsed.pathname;

  // SPA-like: map "/" and unknown routes to index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // prevent path traversal
  const filePath = path.normalize(path.join(FRONTEND_DIR, pathname));
  if (!filePath.startsWith(FRONTEND_DIR)) {
    return sendText(res, 403, 'Acesso negado');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // fallback to index.html for client-side routing
      const indexPath = path.join(FRONTEND_DIR, 'index.html');
      fs.readFile(indexPath, (err2, data) => {
        if (err2) return sendText(res, 404, 'Arquivo não encontrado');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  });
}

function filterProducts(products, query) {
  const term = (query.term || '').toString().toLowerCase().trim();
  const category = (query.category || '').toString().toLowerCase().trim();
  if (!term && !category) return products;
  return products.filter((p) => {
    const matchTerm = term
      ? (p.name || '').toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term)
      : true;
    const matchCategory = category
      ? (p.category || '').toLowerCase() === category
      : true;
    return matchTerm && matchCategory;
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const { pathname, query } = parsed;

  if (pathname.startsWith('/api/')) {
    // API routes
    const products = readJSON(DATA_FILE) || [];

    if (pathname === '/api/products' && req.method === 'GET') {
      const filtered = filterProducts(products, query);
      return sendJSON(res, 200, filtered);
    }

    // /api/products/:id
    const productIdMatch = pathname.match(/^\/api\/products\/(\w[\w-]*)$/);
    if (productIdMatch && req.method === 'GET') {
      const id = productIdMatch[1];
      const product = products.find((p) => String(p.id) === String(id));
      if (!product) return sendJSON(res, 404, { message: 'Produto não encontrado' });
      return sendJSON(res, 200, product);
    }

    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJSON(res, 200, { status: 'ok' });
    }

    return sendJSON(res, 404, { message: 'Rota da API não encontrada' });
  }

  // Static files
  return serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Servidor do brechó rodando em http://localhost:${PORT}`);
});
