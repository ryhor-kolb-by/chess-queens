const form = document.querySelector('#solve-form');
const input = document.querySelector('#board-size');
const button = document.querySelector('#solve-button');
const status = document.querySelector('#status');
const boardWrap = document.querySelector('#board-wrap');
const boardElement = document.querySelector('#board');
const result = document.querySelector('#result');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const size = Number(input.value);
  if (!Number.isInteger(size) || size < 2 || size > 8) {
    status.textContent = 'Board size must be an integer between 2 and 8.';
    status.className = 'status error';
    return;
  }

  button.disabled = true;
  status.textContent = 'Searching for an optimal placement…';
  status.className = 'status';
  boardWrap.hidden = true;

  try {
    const response = await fetch('/api/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ size }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Could not get a solution.');

    if (!data.queens) {
      status.textContent = 'No valid placement was found for this board size.';
      status.className = 'status error';
      return;
    }

    renderBoard(size, data.queens);
    result.textContent = `Minimum number of queens: ${data.queens.length}`;
    boardWrap.hidden = false;
    status.textContent = 'Solution found';
    status.className = 'status success';
  } catch (error) {
    status.textContent = error.message || 'Could not connect to the server. Make sure the app is running.';
    status.className = 'status error';
  } finally {
    button.disabled = false;
  }
});

function renderBoard(size, queens) {
  const queenSquares = new Set(queens.map(({ row, column }) => `${row},${column}`));
  boardElement.style.setProperty('--size', size);
  boardElement.replaceChildren();

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const square = document.createElement('div');
      const isQueen = queenSquares.has(`${row},${column}`);
      square.className = `square ${(row + column) % 2 === 0 ? 'light' : 'blue'}`;
      square.setAttribute('role', 'gridcell');
      square.setAttribute('aria-label', `Row ${row + 1}, column ${column + 1}${isQueen ? ', queen' : ''}`);
      if (isQueen) {
        const piece = document.createElement('span');
        piece.className = 'queen';
        piece.textContent = '♛';
        square.append(piece);
      }
      boardElement.append(square);
    }
  }
}
