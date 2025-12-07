import http from 'node:http';
import { router } from './routes.js';
import { env } from './config/env.js';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }
  router(req, res);
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(env.port, () => {
    console.log(`API running on port ${env.port}`);
  });
}

export default server;
