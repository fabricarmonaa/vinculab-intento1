// frontEnd/src/features/school/services/schoolDataService.js
import client from "../../../api/client";

export async function fetchSchools() {
  const body = await client.get("/schools", { auth: false });
  const data = body?.data || body;
  const items = data.items || data || [];
  return items;
}
