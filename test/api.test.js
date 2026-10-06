import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApiServer } from '../server/index.js';

let server;
let baseUrl;

beforeEach(async () => {
  server = createApiServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('solves a board and returns the API response shape', async () => {
  const response = await fetch(`${baseUrl}/api/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ size: 2 }),
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.size, 2);
  assert.equal(data.queens.length, 1);
});

test('accepts the maximum board size', async () => {
  const response = await fetch(`${baseUrl}/api/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ size: 8 }),
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.queens.length, 5);
});

test('rejects invalid board sizes and malformed JSON', async () => {
  for (const body of ['{"size":1}', '{"size":9}', '{"size":2.5}', '{"size":"4"}', '{']) {
    const response = await fetch(`${baseUrl}/api/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, 'string');
  }
});

test('serves the browser UI and static assets', async () => {
  const page = await fetch(baseUrl);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  const html = await page.text();
  assert.match(html, /<html lang="en">/);
  assert.match(html, /Queen Domination Puzzle/);

  const script = await fetch(`${baseUrl}/src/main.js`);
  assert.equal(script.status, 200);
  assert.match(script.headers.get('content-type'), /javascript/);
  assert.match(await script.text(), /fetch\('\/api\/solve'/);

  const style = await fetch(`${baseUrl}/src/style.css`);
  assert.equal(style.status, 200);
  assert.match(style.headers.get('content-type'), /text\/css/);
});

test('does not expose files outside the frontend directory', async () => {
  const response = await fetch(`${baseUrl}/%2e%2e/server/index.js`);
  assert.equal(response.status, 404);
  assert.equal(typeof (await response.json()).error, 'string');
});

test('rejects unsupported methods and paths', async () => {
  const methodResponse = await fetch(`${baseUrl}/api/solve`);
  assert.equal(methodResponse.status, 405);
  assert.equal(methodResponse.headers.get('allow'), 'POST');

  const pathResponse = await fetch(`${baseUrl}/unknown`);
  assert.equal(pathResponse.status, 404);
});
