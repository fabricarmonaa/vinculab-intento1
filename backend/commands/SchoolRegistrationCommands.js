import { SchoolRegistrationService } from '../services/SchoolRegistrationService.js';

const schoolRegService = new SchoolRegistrationService();

export async function approveSchoolCommand(registrationId) {
  return schoolRegService.decide(registrationId, 'APPROVED');
}

export async function rejectSchoolCommand(registrationId) {
  return schoolRegService.decide(registrationId, 'REJECTED');
}
