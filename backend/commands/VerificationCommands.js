import { StudentVerificationService } from '../services/StudentVerificationService.js';

const verificationService = new StudentVerificationService();

export async function requestVerificationCommand(context, body) {
  return verificationService.requestVerification(context.user.userId, body.schoolId);
}

export async function decideVerificationCommand(context, verificationId, decision) {
  return verificationService.decide(verificationId, decision, context.user.userId);
}
