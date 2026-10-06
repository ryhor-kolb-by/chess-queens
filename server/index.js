import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { solveRequest } from './solveRequest.js';

const HOST = 'localhost';
const PORT = 8090;
const MAX_BODY_BYTES = 1024;
const PUBLIC_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
const STATIC_FILES = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/src/main.js', ['src/main.js', 'text/javascript; charset=utf-8']],
  ['/src/style.css', ['src/style.css', 'text/css; charset=utf-8']],
]);

export function createApiServer() {
  return createServer(async (request, response) => {
    let pathname;
    try {
      pathname = new URL(request.url, 'http://localhost').pathname;
    } catch {
      sendJson(response, 400, { error: 'Invalid request URL.' });
      return;
    }

    if (pathname === '/api/solve') {
      await handleSolve(request, response);
      return;
    }

    const staticFile = STATIC_FILES.get(pathname);
    if (staticFile) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.setHeader('Allow', 'GET, HEAD');
        sendJson(response, 405, { error: 'Use GET or HEAD for this resource.' });
        return;
      }
      await serveStaticFile(response, staticFile, request.method === 'HEAD');
      return;
    }

    sendJson(response, 404, { error: 'Endpoint not found.' });
  });
}

async function handleSolve(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJson(response, 405, { error: 'Use POST for this endpoint.' });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const result = solveRequest(body);
    sendJson(response, result.statusCode, result.payload);
  } catch (error) {
    const status = error.statusCode ?? 400;
    sendJson(response, status, { error: error.message || 'Invalid request.' });
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
        const error = new Error('Request body is too large.');
        error.statusCode = 413;
        reject(error);
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Request body must be valid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

async function serveStaticFile(response, [relativePath, contentType], headOnly) {
  const filePath = resolve(PUBLIC_ROOT, relativePath);
  if (!filePath.startsWith(`${PUBLIC_ROOT}${sep}`)) {
    sendJson(response, 404, { error: 'File not found.' });
    return;
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length,
    });
    response.end(headOnly ? undefined : content);
  } catch {
    sendJson(response, 404, { error: 'File not found.' });
  }
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createApiServer();
  server.listen(PORT, HOST, () => {
    console.log(`Queen app is running at http://${HOST}:${PORT}`);
  });
}
