import client from "../../../api/client";

export const getJobs = async ({ q = '', status = '' } = {}) => {
    const body = await client.get("/offers", { params: { q, status } });
    const data = body.data || body;
    const items = data.items || data || [];

    return items.map(job => ({
        id: job.offerId || job.offer_id || job.id,
        title: job.title,
        status: job.status,
        companyId: job.companyId || job.company_id,
        companyName: job.companyName || job.company_name || "Empresa",
        createdAt: job.createdAt || job.created_at,
        description: job.description,
        requirements: job.requirements,
        salaryRange: job.salaryRange,
        specialty: job.specialty,
        location: job.location, // Added
        modality: job.modality // Added
    }));
};

export const getJobById = async (id) => {
    const body = await client.get(`/offers/${id}`);
    const job = body.data || body;
    if (!job) return null;

    return {
        id: job.offerId || job.offer_id || job.id,
        title: job.title,
        status: job.status,
        companyId: job.companyId || job.company_id,
        companyName: job.companyName || job.company_name || "Empresa",
        createdAt: job.createdAt || job.created_at,
        description: job.description,
        requirements: job.requirements,
        salaryRange: job.salaryRange,
        specialty: job.specialty
    };
};

export const getJobsByCompany = async (token) => {
    const body = await client.get("/offers/company", { token });
    const data = body.data || body;
    const items = data.items || data || [];
    return items.map(job => ({
        id: job.offerId || job.offer_id || job.id,
        title: job.title,
        status: job.status,
        companyId: job.companyId || job.company_id,
        companyId: job.companyId || job.company_id,
        createdAt: job.createdAt || job.created_at,
        description: job.description,
        location: job.location,
        modality: job.modality,
        salaryRange: job.salaryRange,
        specialty: job.specialty // In case it's added later
    }));
};

export const createJob = async (token, jobData) => {
    const body = await client.post("/offers", jobData, { token });
    return body.data || body;
};

export const updateJob = async (jobId, jobData, token) => {
    const body = await client.put(`/offers/${jobId}`, jobData, { token });
    return body.data || body;
};

export const deleteJob = async (jobId, token) => {
    await client.delete(`/offers/${jobId}`, { token });
    return true;
};