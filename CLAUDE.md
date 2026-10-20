# CLAUDE.md

Guidance for Claude Code (or any agent) working in this repository.

## Commands

- `npm start` / `npm run dev` — start the local server at `http://localhost:8090`.
- `npm test` — run all tests with Node's built-in test runner (`node --test`).

## Architecture

The project follows a small ports-and-adapters shape: one solver core, one shared
validation layer, and two thin adapters that expose it over HTTP.

- `server/queenSolver.js` — the solver core. Pure logic, no HTTP, no I/O. Exports
  `MIN_BOARD_SIZE`, `MAX_BOARD_SIZE`, and `solveQueens(size)`.
- `server/solveRequest.js` — shared request validation and solver invocation, used
  by both HTTP adapters so they behave identically.
- `server/index.js` — local adapter: a single Node `http` server that serves both
  the static UI (from `public/`) and `POST /api/solve`.
- `api/solve.js` — Vercel adapter: the same `solveRequest` logic as a serverless
  function.
- `public/` — static HTML/CSS/JS client, no build step, no framework.
- `test/` — tests for the solver and both HTTP adapters.

## Conventions

- **Zero third-party dependencies.** Keep it that way; this is a deliberate
  constraint, not an oversight.
- **Board size bounds (2–8) live only in `queenSolver.js`** (`MIN_BOARD_SIZE`,
  `MAX_BOARD_SIZE`). Other layers should import and reuse these constants rather
  than hardcoding the range again.
- **Keep the solver core free of HTTP concerns.** Request parsing, status codes,
  and JSON shaping belong in `solveRequest.js` or the adapters, not in
  `queenSolver.js`.
- Tests use Node's built-in `node:test` and `node:assert/strict` — no test
  framework dependency.
