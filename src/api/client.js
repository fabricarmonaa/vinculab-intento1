// frontEnd/src/api/client.js

// Definimos la URL base de nuestra API.
// Intentamos leerla de las variables de entorno (por si estamos en producción),
// y si no, usamos localhost por defecto.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api/v1";

/**
 * Función: buildUrl
 * -----------------
 * Se encarga de armar la URL completa para hacer la petición.
 * Si le pasás algo que ya empieza con "http", lo deja como está.
 * Si no, le pega la base de la API al principio.
 * 
 * @param {string} path - El camino relativo (ej: "/users") o absoluto.
 * @returns {string} La URL final lista para usar.
 */
function buildUrl(path) {
  if (!path) return API_BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const base = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${base}/${cleanPath}`;
}

async function handleResponse(response) {
  const contentType = response.headers.get("Content-Type") || "";
  let body = null;

  // Chequeamos si la respuesta es JSON o texto plano
  if (contentType.includes("application/json")) {
    body = await response.json();
  } else {
    const text = await response.text();
    body = { ok: response.ok, status: response.status, raw: text };
  }

  // Si la respuesta no fue exitosa (status no es 2xx), tiramos error.
  if (!response.ok || body?.ok === false) {
    const status = body?.status || response.status || 500;
    const message =
      body?.detail ||
      body?.message ||
      "Error al comunicarse con el servidor";

    const error = new Error(message);
    error.status = status;
    throw error;
  }

  return body;
}


async function request(path, options = {}) {
  const {
    method = "GET",
    data,
    params,
    token,
    headers = {},
    auth = true, 
  } = options;

  const url = new URL(buildUrl(path));

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const finalHeaders = { ...headers };

  // Si estamos mandando datos, avisamos que es JSON
  if (data !== undefined && data !== null) {
    finalHeaders["Content-Type"] = "application/json";
  }

  // Manejo del Token de Autenticación (Bearer Token)
  if (auth !== false) {
    // Buscamos el token en las opciones o en el localStorage
    const t = token || localStorage.getItem("token");
    // Validamos que no sea el string "undefined" (error común)
    if (t && t !== "undefined") {
      finalHeaders["Authorization"] = `Bearer ${t}`;
    }
  }

  // Hacemos la petición real al mundo exterior
  const res = await fetch(url.toString(), {
    method,
    headers: finalHeaders,
    body: data != null ? JSON.stringify(data) : undefined,
  });

  // Procesamos el resultado
  return handleResponse(res);
}

// --- Helpers (Atajos) ---
// Estas funciones son para no tener que escribir "method: 'POST'" todo el tiempo.

export function apiGet(path, options = {}) {
  return request(path, { ...options, method: "GET" });
}

export function apiPost(path, data, options = {}) {
  return request(path, { ...options, method: "POST", data });
}

export function apiPut(path, data, options = {}) {
  return request(path, { ...options, method: "PUT", data });
}

export function apiDelete(path, options = {}) {
  return request(path, { ...options, method: "DELETE" });
}

// Exportamos un objeto 'client' que agrupa todo.
const client = {
  request,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};

export default client;
