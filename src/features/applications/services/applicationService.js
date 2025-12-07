import client from "../../../api/client";

export const createApplication = async (offerId, token) => {

  const body = await client.post("/applications", { offerId }, { token });
  return body.data || body;
};

export const getApplicantsForJob = async (jobId, token) => {
  const body = await client.get(`/offers/${jobId}/applications`, { token });
  const data = body.data || body;
  const items = data.items || data || [];

  if (!Array.isArray(items)) {
    console.warn('getApplicantsForJob: Expected array but got:', typeof items, items);
    return [];
  }

  return items;
};

export const getApplicationsByStudent = async (token) => {
  const body = await client.get("/applications/me", { token });
  const data = body.data || body;
  const items = data.items || data || [];

  return items.map(app => ({
    ...app,
    id: app.applicationId || app.id,
    jobTitle: app.offerTitle || app.jobTitle || "Oferta",
    companyName: app.companyName || "Empresa"
  }));
};

export const cancelApplication = async (applicationId, token) => {
  await client.post(`/applications/${applicationId}/cancel`, {}, { token });
  return { success: true };
};

export const decideApplication = async (applicationId, status, token) => {
  const body = await client.put(`/applications/${applicationId}/decision`, { status }, { token });
  return body.data || body;
};

export const requestVerification = async (token, schoolId) => {
  const body = await client.post("/verifications", { schoolId }, { token });
  return body.data || body;
};