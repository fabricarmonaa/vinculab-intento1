import { withTransaction } from '../config/database.js';
import { ApplicationRepository } from '../repositories/ApplicationRepository.js';
import { VerificationRepository } from '../repositories/VerificationRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { OfferRepository } from '../repositories/OfferRepository.js';
import { CompanyRepository } from '../repositories/CompanyRepository.js';

const ALLOWED = {
  SENT: ['REVIEWING', 'REJECTED'],
  REVIEWING: ['ACCEPTED', 'REJECTED'],
};

export class ApplicationService {
  constructor() {
    this.applicationRepo = new ApplicationRepository();
    this.verificationRepo = new VerificationRepository();
    this.studentRepo = new StudentRepository();
    this.offerRepo = new OfferRepository();
    this.companyRepo = new CompanyRepository();
  }

  async create(studentUserId, offerId) {
    const student = await this.studentRepo.findByUserId(studentUserId);
    if (!student) throw new Error('Estudiante no encontrado');
    const verification = await this.verificationRepo.findLatestApproved(student.id);
    if (!verification) throw new Error('Solo estudiantes verificados pueden postularse');

    return withTransaction(async (connection) => {
      return this.applicationRepo.create({ studentId: student.id, offerId }, connection);
    });
  }

  async listMine(studentUserId) {
    const student = await this.studentRepo.findByUserId(studentUserId);
    if (!student) return [];
    return this.applicationRepo.listByStudent(student.id);
  }

  async listForOffer(companyUserId, offerId) {
    const company = await this.companyRepo.findByUserId(companyUserId);
    if (!company) throw new Error('Empresa no encontrada');
    const offer = await this.offerRepo.findById(offerId);
    if (!offer || offer.company_id !== company.id) throw new Error('Oferta no pertenece a la empresa');
    return this.applicationRepo.listByOffer(offerId);
  }

  async transition(applicationId, decision) {
    return withTransaction(async (connection) => {
      const application = await this.applicationRepo.findById(applicationId, connection);
      if (!application) throw new Error('Postulación no existe');
      const next = ALLOWED[application.status];
      if (!next || !next.includes(decision)) throw new Error('Transición no permitida');
      await this.applicationRepo.updateStatus(connection, applicationId, decision);
      return { applicationId, status: decision };
    });
  }

  async cancel(applicationId) {
    return this.transition(applicationId, 'REJECTED');
  }
}
