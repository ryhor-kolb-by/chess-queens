# Technical Specification: Queen Domination on a Chessboard

## 1. Project Goal

Build an educational Node.js application that finds the minimum number of queens needed to cover every empty square on a user-sized chessboard and displays the placement in a browser.

## 2. Problem Rules

- The user chooses the size of a square board.
- The supported size is an integer from **2 to 8**, inclusive.
- A queen attacks any distance along its row, column, and diagonals.
- Queens in the placement **must not attack one another**.
- Every empty square must be attacked by at least one queen.
- A square occupied by a queen is not empty and does not need to be covered by another queen.
- Find a placement with the minimum number of queens. Displaying one optimal placement is sufficient.

## 3. Functional Requirements

### 3.1. Input and Results

- The user enters the board size and starts the search.
- The app validates that the value is an integer from 2 to 8.
- A loading state is displayed while the solution is being calculated.
- On success, the board, queen positions, and minimum queen count are displayed.
- Invalid input and server errors are reported with clear messages.

### 3.2. Board Display

- The board has dimensions `N × N`, based on the user input.
- Squares alternate between white and light blue.
- Queens are shown as black symbols.
- The board and squares adapt to the viewport; on a typical Full HD display the full page and board should fit vertically.

## 4. Technical Requirements

- Both server and client logic use **Node.js and JavaScript**.
- Java, Maven, and Vite are not used.
- The local app uses a single server process with Node.js built-in modules to handle the API and serve the HTML, CSS, and JavaScript UI.
- The local server listens on `localhost:8090`.
- For Vercel, the UI is deployed as static files from `public/` and `POST /api/solve` is deployed as a serverless function from `api/solve.js`.
- No third-party backend libraries are required.

## 5. Solver

The solver must find an exact minimum, not just any valid placement. A recommended approach is backtracking: search from smaller queen counts upward, reject placements where queens attack one another, and accept a complete placement only if every empty square is covered.

The solver returns a list of zero-based `{ row, column }` coordinates, or `null` if no solution is found.

## 6. HTTP Interface

### `POST /api/solve`

Request:

```json
{"size": 8}
```

Example successful response:

```json
{
  "size": 8,
  "queens": [
    {"row": 0, "column": 0},
    {"row": 1, "column": 2},
    {"row": 2, "column": 4},
    {"row": 3, "column": 1},
    {"row": 4, "column": 3}
  ]
}
```

The returned coordinates depend on the solution found. Request errors are returned as JSON with an `error` field. The `size` value must be an integer from 2 to 8.

### Static Assets

- `GET /` serves the main HTML page.
- `GET /src/main.js` serves the client logic.
- `GET /src/style.css` serves the styles.
- Unknown paths return 404. Requests must not be able to read arbitrary files from disk.

## 7. Project Structure and Commands

- `server/queenSolver.js` — search algorithm.
- `server/solveRequest.js` — shared input validation and solver invocation.
- `server/index.js` — local HTTP API and static file server.
- `api/solve.js` — Vercel serverless function for `POST /api/solve`.
- `public/` — static HTML, CSS, and client-side JavaScript.
- `test/` — automated solver, local server, and function tests.
- `npm run dev` or `npm start` — start the local app.
- `npm test` — run tests with Node.js's built-in test runner.

## 8. Acceptance Criteria

- Only board sizes 2–8 are accepted; invalid input produces an error message.
- No pair of queens in a returned solution attacks one another.
- Every empty square is attacked by at least one queen.
- The number of queens is minimal, and the UI displays that count.
- Locally, one Node.js server serves the UI and API without Vite; on Vercel, the UI is static and the API runs as a serverless function.
- HTML, JavaScript, and CSS responses have correct HTTP Content-Type headers.
- Tests cover valid and invalid requests, static assets, placement validity, and minimality for small boards.
