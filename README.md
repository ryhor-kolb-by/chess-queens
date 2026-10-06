# Queen Domination on a Chessboard

An educational Node.js web app that finds a minimum-size placement of queens covering every empty square on a chessboard and displays the result in a browser.

![Queen puzzle app screenshot](docs/screenshot.png)

## Rules

- The board size must be an integer from **2 to 8**, inclusive.
- A queen attacks along its row, column, and diagonals.
- Queens must not attack one another.
- Every empty square must be attacked by at least one queen.
- Squares occupied by queens do not need to be covered by another queen.
- The app displays one placement using the minimum number of queens.

## Requirements

- Node.js 20 or later.

## Run

From the project root, run:

```bash
npm run dev
```

Then open [http://localhost:8090](http://localhost:8090) in a browser. The Node.js server serves both the web UI and the API.

To start the app in production mode, run:

```bash
npm start
```

## API

### `POST /api/solve`

Request body:

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

Coordinates are zero-based. Invalid JSON or a size outside 2–8 returns an error response with an `error` field.

## Tests

Run the automated tests with:

```bash
npm test
```

Tests cover placement validity and minimality on small boards, the 8×8 board, API validation, and serving the HTML, CSS, and JavaScript assets.

## Project structure

```text
server/
  index.js             HTTP server, API, and static file serving
  queenSolver.js       minimum queen placement solver
frontend/
  index.html           page markup
  src/main.js          input handling, API request, and board rendering
  src/style.css        styles
 test/
  api.test.js          HTTP server tests
  queenSolver.test.js  solver tests
TASK_SPEC.md           full project specification
```

See [TASK_SPEC.md](TASK_SPEC.md) for detailed requirements and acceptance criteria.
