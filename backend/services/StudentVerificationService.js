import { withTransaction } from '../config/database.js';
import { VerificationRepository } from '../repositories/VerificationRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { SchoolRepository } from '../repositories/SchoolRepository.js';
import { StudentVerificationStateMachine } from '../stateMachines/StudentVerificationStateMachine.js';

export class StudentVerificationService {
  constructor() {
    this.verificationRepo = new VerificationRepository();
    this.studentRepo = new StudentRepository();
    this.schoolRepo = new SchoolRepository();
  }

  async requestVerification(studentUserId, schoolId) {
    const student = await this.studentRepo.findByUserId(studentUserId);
    if (!student) throw new Error('Estudiante no encontrado');

    const active = await this.verificationRepo.findActiveForStudent(student.id);
    if (active) throw new Error('Ya existe una solicitud activa');

    return withTransaction(async (connection) => {
      return this.verificationRepo.createRequest(
        { studentId: student.id, schoolId, status: StudentVerificationStateMachine.initial() },
        connection
      );
    });
  }

  async decide(verificationId, decision, schoolUserId) {
    StudentVerificationStateMachine.assertKnown(decision);

    return withTransaction(async (connection) => {
      const verification = await this.verificationRepo.findById(verificationId, connection);
      if (!verification) throw new Error('Verificación no existe');
      StudentVerificationStateMachine.ensureTransition(verification.status, decision);

      const school = await this.schoolRepo.findByUserId(schoolUserId, connection);
      if (!school || school.id !== verification.school_id) throw new Error('Escuela no autorizada');

      await this.verificationRepo.updateStatus(connection, verificationId, decision);
      return { verificationId, status: decision };
    });
  }

  async listPendingForSchool(schoolUserId) {
    const school = await this.schoolRepo.findByUserId(schoolUserId);
    if (!school) return [];
    return this.verificationRepo.listPendingBySchool(school.id);
  }

  async listApprovedForSchool(schoolUserId) {
    const school = await this.schoolRepo.findByUserId(schoolUserId);
    if (!school) return [];
    return this.verificationRepo.listApprovedBySchool(school.id);
  }

  async listMyVerifications(studentUserId) {
    const student = await this.studentRepo.findByUserId(studentUserId);
    if (!student) return [];
    return this.verificationRepo.listByStudent(student.id);
  }
}
