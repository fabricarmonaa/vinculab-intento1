import { StudentVerificationService } from '../services/StudentVerificationService.js';

const verificationService = new StudentVerificationService();

export async function listPendingVerificationsQuery(context) {
  return verificationService.listPendingForSchool(context.user.userId);
}

export async function listApprovedVerificationsQuery(context) {
  return verificationService.listApprovedForSchool(context.user.userId);
}

export async function listMyVerificationsQuery(context) {
  return verificationService.listMyVerifications(context.user.userId);
}
