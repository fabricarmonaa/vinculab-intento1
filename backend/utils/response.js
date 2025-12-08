export function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

export function notFound(res) {
  sendJson(res, 404, { message: 'Not Found' });
}

export function methodNotAllowed(res) {
  sendJson(res, 405, { message: 'Method Not Allowed' });
}
