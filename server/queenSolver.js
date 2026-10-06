export const MIN_BOARD_SIZE = 2;
export const MAX_BOARD_SIZE = 8;

export function solveQueens(size) {
  if (!Number.isInteger(size) || size < MIN_BOARD_SIZE || size > MAX_BOARD_SIZE) {
    throw new RangeError('Board size must be an integer between 2 and 8.');
  }

  for (let target = 1; target <= size; target += 1) {
    const search = new QueenSearch(size, target);
    const solution = search.find(0, 0);
    if (solution) return solution;
  }

  return null;
}

class QueenSearch {
  constructor(size, target) {
    this.size = size;
    this.target = target;
    this.columns = new Array(size).fill(false);
    this.descendingDiagonals = new Array(size * 2 - 1).fill(false);
    this.ascendingDiagonals = new Array(size * 2 - 1).fill(false);
    this.attackCounts = Array.from({ length: size }, () => new Uint8Array(size));
    this.queens = [];
  }

  find(row, placed) {
    if (placed > this.target || placed + this.size - row < this.target) return null;
    if (row === this.size) {
      return placed === this.target && this.allSquaresCovered()
        ? this.queens.map(({ row: queenRow, column }) => ({ row: queenRow, column }))
        : null;
    }

    for (let column = 0; column < this.size; column += 1) {
      const descending = row - column + this.size - 1;
      const ascending = row + column;
      if (this.columns[column] || this.descendingDiagonals[descending] || this.ascendingDiagonals[ascending]) {
        continue;
      }

      const queen = { row, column };
      this.queens.push(queen);
      this.columns[column] = true;
      this.descendingDiagonals[descending] = true;
      this.ascendingDiagonals[ascending] = true;
      this.markAttacks(queen, 1);

      const solution = this.find(row + 1, placed + 1);
      if (solution) return solution;

      this.markAttacks(queen, -1);
      this.ascendingDiagonals[ascending] = false;
      this.descendingDiagonals[descending] = false;
      this.columns[column] = false;
      this.queens.pop();
    }

    return this.find(row + 1, placed);
  }

  markAttacks(queen, change) {
    for (let row = 0; row < this.size; row += 1) {
      for (let column = 0; column < this.size; column += 1) {
        if (row === queen.row || column === queen.column
            || Math.abs(row - queen.row) === Math.abs(column - queen.column)) {
          this.attackCounts[row][column] += change;
        }
      }
    }
  }

  allSquaresCovered() {
    return this.attackCounts.every((row) => row.every((attackCount) => attackCount > 0));
  }
}
