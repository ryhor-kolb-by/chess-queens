import { solveRequest } from '../server/solveRequest.js';

export function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { error: 'Use POST for this endpoint.' });
  }

  const result = solveRequest(request.body);
  return sendJson(response, result.statusCode, result.payload);
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

export default handler;
