// frontEnd/src/features/company/services/companyService.js

import { authHeaders } from '../../auth/services/authService';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function handleResponse(response) {
  const contentType = response.headers.get('Content-Type') || '';
  let body = null;

  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    const text = await response.text();
    body = { ok: response.ok, status: response.status, raw: text };
  }

  if (!response.ok || body?.ok === false) {
    const status = body?.status || response.status || 500;
    const message =
      body?.detail ||
      body?.message ||
      'Error al comunicarse con el servidor';

    const error = new Error(message);
    error.status = status;
    throw error;
  }

  return body;
}


