import { ApplicationService } from '../services/ApplicationService.js';

const applicationService = new ApplicationService();

export async function listMyApplicationsQuery(context) {
  return applicationService.listMine(context.user.userId);
}

export async function listApplicantsForOfferQuery(context, offerId) {
  return applicationService.listForOffer(context.user.userId, offerId);
}
