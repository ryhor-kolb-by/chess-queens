import test from 'node:test';
import assert from 'node:assert/strict';
import { solveQueens } from '../server/queenSolver.js';

test('returns valid minimum placements for sizes 2 through 5', () => {
  for (let size = 2; size <= 5; size += 1) {
    const queens = solveQueens(size);
    assert.ok(queens, `Expected a solution for ${size}x${size}`);
    assertValidPlacement(size, queens);
    assert.equal(hasSolutionWithFewerQueens(size, queens.length), false,
      `Expected the placement for ${size}x${size} to be minimal`);
  }
});

test('finds a valid placement for the maximum supported size', () => {
  const queens = solveQueens(8);
  assert.ok(queens);
  assertValidPlacement(8, queens);
});

test('rejects sizes outside 2 through 8 and non-integers', () => {
  for (const size of [1, 9, 2.5, NaN, '4']) {
    assert.throws(() => solveQueens(size), RangeError);
  }
});

function assertValidPlacement(size, queens) {
  for (let first = 0; first < queens.length; first += 1) {
    for (let second = first + 1; second < queens.length; second += 1) {
      const a = queens[first];
      const b = queens[second];
      assert.notEqual(a.row, b.row, 'Queens share a row');
      assert.notEqual(a.column, b.column, 'Queens share a column');
      assert.notEqual(Math.abs(a.row - b.row), Math.abs(a.column - b.column), 'Queens share a diagonal');
    }
  }

  const queenSquares = new Set(queens.map(({ row, column }) => `${row},${column}`));
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (queenSquares.has(`${row},${column}`)) continue;
      assert.ok(queens.some((queen) => attacks(queen, row, column)), `Uncovered square ${row},${column}`);
    }
  }
}

function hasSolutionWithFewerQueens(size, limit) {
  return searchPlacements(size, limit, 0, []);
}

function searchPlacements(size, limit, start, queens) {
  for (let cell = start; cell < size * size; cell += 1) {
    if (queens.length + 1 >= limit) break;
    const row = Math.floor(cell / size);
    const column = cell % size;
    if (queens.some((queen) => attacks(queen, row, column))) continue;

    queens.push({ row, column });
    if (isCovered(size, queens) || searchPlacements(size, limit, cell + 1, queens)) return true;
    queens.pop();
  }
  return false;
}

function isCovered(size, queens) {
  const queenSquares = new Set(queens.map(({ row, column }) => `${row},${column}`));
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (queenSquares.has(`${row},${column}`)) continue;
      if (!queens.some((queen) => attacks(queen, row, column))) return false;
    }
  }
  return true;
}

function attacks(queen, row, column) {
  return queen.row === row || queen.column === column
    || Math.abs(queen.row - row) === Math.abs(queen.column - column);
}
