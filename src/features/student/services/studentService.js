import client from "../../../api/client";

/**
 * SOLICITAR VERIFICACIÓN
 * ----------------------
 * Rol: Estudiante
 * Método: POST
 * Ruta: /verifications
 */
export const requestVerification = async (token, schoolId) => {
    console.log("[StudentService] Solicitando verificación...", { schoolId });
    const body = await client.post(
        "/verifications",
        { schoolId },
        { token }
    );
    return body?.data || body;
};

/**
 * OBTENER MI HISTORIAL DE VERIFICACIONES
 * --------------------------------------
 * Rol: Estudiante
 * Método: GET
 * Ruta: /verifications/me
 */
export const getMyVerifications = async (token) => {
    const body = await client.get(
        "/verifications/me",
        { token }
    );
    return body?.data || body;
};