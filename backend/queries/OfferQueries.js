import { OfferRepository } from '../repositories/OfferRepository.js';
import { CompanyRepository } from '../repositories/CompanyRepository.js';

const offerRepo = new OfferRepository();
const companyRepo = new CompanyRepository();

export async function listOffersQuery(params) {
  return offerRepo.listAll(params);
}

export async function getOfferByIdQuery(id) {
  return offerRepo.findById(id);
}

export async function listOffersByCompanyQuery(userId) {
  const company = await companyRepo.findByUserId(userId);
  if (!company) return [];
  return offerRepo.listByCompany(company.id);
}
