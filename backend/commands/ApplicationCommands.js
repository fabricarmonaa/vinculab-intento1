import { ApplicationService } from '../services/ApplicationService.js';

const applicationService = new ApplicationService();

export async function createApplicationCommand(context, body) {
  return applicationService.create(context.user.userId, body.offerId);
}

export async function cancelApplicationCommand(context, applicationId) {
  return applicationService.cancel(applicationId);
}

export async function decideApplicationCommand(context, applicationId, decision) {
  return applicationService.transition(applicationId, decision);
}
