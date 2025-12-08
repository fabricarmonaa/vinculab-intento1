import crypto from 'node:crypto';
import { withTransaction } from '../config/database.js';
import { SchoolRegistrationRepository } from '../repositories/SchoolRegistrationRepository.js';
import { SchoolRepository } from '../repositories/SchoolRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { MailerService } from './MailerService.js';
import { SchoolRegistrationStateMachine } from '../stateMachines/SchoolRegistrationStateMachine.js';

export class SchoolRegistrationService {
  constructor() {
    this.registrationRepo = new SchoolRegistrationRepository();
    this.schoolRepo = new SchoolRepository();
    this.userRepo = new UserRepository();
    this.mailer = new MailerService();
  }

  async submitRegistration(payload) {
    const result = await this.registrationRepo.createRequest({
      schoolName: payload.schoolName,
      directorName: payload.directorName,
      cue: payload.cue,
      address: payload.address,
      email: payload.email,
      phone: payload.phone,
      status: SchoolRegistrationStateMachine.initial(),
    });
    return { message: 'Solicitud registrada en estado PENDING', ...result };
  }

  async decide(registrationId, decision) {
    SchoolRegistrationStateMachine.assertKnown(decision);

    return withTransaction(async (connection) => {
      const registration = await this.registrationRepo.findById(registrationId);
      if (!registration) throw new Error('Registro no encontrado');
      SchoolRegistrationStateMachine.ensureTransition(registration.status, decision);

      await this.registrationRepo.updateStatus(connection, registrationId, decision);

      if (decision === 'APPROVED') {
        const school = await this.schoolRepo.createSchool({
          name: registration.school_name,
          directorName: registration.director_name,
          cue: registration.cue,
          address: registration.address,
          email: registration.email,
          phone: registration.phone,
        }, connection);

        const tempPassword = crypto.randomBytes(6).toString('hex');
        const user = await this.userRepo.createUser({ email: registration.email, password: tempPassword, role: 'SCHOOL' }, connection);

        await connection.execute('UPDATE schools SET user_id = ? WHERE id = ?', [user.userId, school.schoolId]);

        await this.mailer.send(
          registration.email,
          'Cuenta de escuela aprobada',
          `Tu escuela fue aprobada. Usuario: ${registration.email} Password temporal: ${tempPassword}`
        );
      }

      return { registrationId, status: decision };
    });
  }
}
