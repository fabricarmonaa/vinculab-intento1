import { parse } from 'node:path';
import fs from 'node:fs';

export async function parseBody(req) {
  const contentType = req.headers['content-type'] || '';
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  if (contentType.includes('application/json')) {
    if (buffer.length === 0) return {};
    return JSON.parse(buffer.toString('utf-8'));
  }

  if (contentType.startsWith('multipart/form-data')) {
    return parseMultipart(bodyFromBuffer(buffer), contentType);
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(buffer.toString('utf-8'));
    return Object.fromEntries(params.entries());
  }

  return { raw: buffer };
}

function bodyFromBuffer(buffer) {
  return buffer.toString('binary');
}

function parseMultipart(body, contentType) {
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) return {};
  const boundary = boundaryMatch[1];
  const parts = body.split(`--${boundary}`);
  const data = {};

  for (const part of parts) {
    if (!part || part === '--\r\n' || part === '--') continue;
    const [rawHeaders, rawValue] = part.split('\r\n\r\n');
    if (!rawHeaders || !rawValue) continue;
    const headerLines = rawHeaders.split('\r\n').filter(Boolean);
    const disposition = headerLines.find((l) => l.toLowerCase().startsWith('content-disposition'));
    if (!disposition) continue;
    const nameMatch = disposition.match(/name="([^"]+)"/);
    if (!nameMatch) continue;
    const name = nameMatch[1];
    const filenameMatch = disposition.match(/filename="([^"]*)"/);

    const value = rawValue.replace(/\r\n--$/, '').replace(/\r\n$/, '');

    if (filenameMatch && filenameMatch[1]) {
      const filename = filenameMatch[1];
      const tempDir = 'uploads';
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      const safeName = `${Date.now()}-${filename}`;
      const filePath = `${tempDir}/${safeName}`;
      fs.writeFileSync(filePath, Buffer.from(value, 'binary'));
      data[name] = { filename, path: filePath };
    } else {
      data[name] = value;
    }
  }
  return data;
}
