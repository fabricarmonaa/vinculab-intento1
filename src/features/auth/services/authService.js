import client from "../../../api/client";

// Helper simple para armar headers si se necesitara manual (aunque el client ya lo hace).
export const authHeaders = (token) => {
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};


export async function loginUser(email, password) {
    const body = await client.post("/auth/login", { email, password });
    return body.data || body;
}


export async function registerUser(payload) {
    // POST a /auth/register
    const body = await client.post("/auth/register", payload);
    return body.data || body;
}


export async function getCurrentUser(token) {
    // GET a /auth/me
    const body = await client.get("/auth/me", { token });
    return body.data || body;
}


export async function refreshUser() {
    const body = await client.get("/auth/me");
    return body.data || body;
}


export async function updateProfile(payload, token) {
    // Chequeamos si estamos mandando archivos (FormData) o datos normales (JSON)
    const isFormData = payload instanceof FormData;

    if (isFormData) {
        const response = await fetch('http://localhost:3000/api/v1/auth/me', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: payload
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error actualizando perfil');
        }

        return await response.json();
    } else {
        const body = await client.put("/auth/me", payload, { token });
        return body.data || body;
    }
}