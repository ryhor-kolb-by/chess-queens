import { MIN_BOARD_SIZE, MAX_BOARD_SIZE, solveQueens } from './queenSolver.js';

export function solveRequest(body) {
  if (!Number.isInteger(body?.size)
      || body.size < MIN_BOARD_SIZE || body.size > MAX_BOARD_SIZE) {
    return {
      statusCode: 400,
      payload: { error: 'Board size must be an integer between 2 and 8.' },
    };
  }

  return {
    statusCode: 200,
    payload: { size: body.size, queens: solveQueens(body.size) },
  };
}
