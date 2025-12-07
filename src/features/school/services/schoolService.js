import client from "../../../api/client";

const BASE = "/verifications";

// 1. Traer PENDIENTES
export const getPendingStudents = async (token) => {
    const body = await client.get(`${BASE}/school/pending`, { token });
    return body.data || [];
};

// 2. Traer VERIFICADOS
export const getVerifiedStudents = async (token) => {
    const body = await client.get(`${BASE}/school/approved`, { token });
    return body.data || [];
};

// 3. Actualizar Estado
export const updateStudentStatus = async (verificationId, status, token) => {
    const body = await client.post(`${BASE}/${verificationId}/decide`, { status }, { token });
    return body.data;
};

// 4. Solicitud de Registro (Escuela)
export const submitSchoolApplication = async (formData) => {
    // POST /auth/register (el backend maneja el rol 'school' o 'ESCUELA')
    const payload = { ...formData, role: 'school' };
    const body = await client.post("/auth/register", payload);
    return body.data || body;
};

// 5. Listar Escuelas (Público)
export const getSchools = async () => {
    const body = await client.get("/schools");
    return body.data || [];
};