import { OfferRepository } from '../repositories/OfferRepository.js';
import { CompanyRepository } from '../repositories/CompanyRepository.js';

const offerRepo = new OfferRepository();
const companyRepo = new CompanyRepository();

export async function createOfferCommand(context, body) {
  const company = await companyRepo.findByUserId(context.user.userId);
  if (!company) throw new Error('Empresa no encontrada');
  const result = await offerRepo.createOffer({
    companyId: company.id,
    title: body.title,
    description: body.description,
    requirements: body.requirements,
    salaryRange: body.salaryRange,
    specialty: body.specialty,
    status: body.status || 'ACTIVE',
    location: body.location,
    modality: body.modality,
  });
  return { offerId: result.offerId };
}

export async function updateOfferCommand(context, offerId, body) {
  const company = await companyRepo.findByUserId(context.user.userId);
  const offer = await offerRepo.findById(offerId);
  if (!offer || !company || offer.company_id !== company.id) throw new Error('No autorizado');
  await offerRepo.updateOffer(offerId, body);
  return { offerId, message: 'Oferta actualizada' };
}

export async function deleteOfferCommand(context, offerId) {
  const company = await companyRepo.findByUserId(context.user.userId);
  const offer = await offerRepo.findById(offerId);
  if (!offer || !company || offer.company_id !== company.id) throw new Error('No autorizado');
  await offerRepo.deleteOffer(offerId);
  return { message: 'Oferta eliminada' };
}
