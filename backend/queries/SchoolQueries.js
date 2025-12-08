import { SchoolRepository } from '../repositories/SchoolRepository.js';

const schoolRepo = new SchoolRepository();

export async function listSchoolsQuery() {
  return schoolRepo.listAll();
}
