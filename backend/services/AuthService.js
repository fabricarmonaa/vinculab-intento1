import crypto from 'node:crypto';
import { UserRepository } from '../repositories/UserRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { CompanyRepository } from '../repositories/CompanyRepository.js';
import { SchoolRegistrationService } from './SchoolRegistrationService.js';
import { TokenService } from './TokenService.js';
import { VerificationRepository } from '../repositories/VerificationRepository.js';

export class AuthService {
  constructor() {
    this.userRepo = new UserRepository();
    this.studentRepo = new StudentRepository();
    this.companyRepo = new CompanyRepository();
    this.schoolRegistrationService = new SchoolRegistrationService();
    this.tokenService = new TokenService();
    this.verificationRepo = new VerificationRepository();
  }

  async register(payload) {
    const role = payload.role?.toLowerCase();
    if (role === 'student') {
      const user = await this.userRepo.createUser({ email: payload.email, password: payload.password, role: 'STUDENT' });
      await this.studentRepo.createProfile({
        userId: user.userId,
        name: payload.name,
        lastName: payload.lastName,
        dni: payload.dni,
        skills: payload.skills,
        description: payload.description,
        cvUrl: payload.cv,
        schoolId: payload.schoolId,
      });
      return { ...user };
    }

    if (role === 'company') {
      const user = await this.userRepo.createUser({ email: payload.email, password: payload.password, role: 'COMPANY' });
      await this.companyRepo.createProfile({
        userId: user.userId,
        legalName: payload.legalName,
        companyName: payload.companyName,
        taxId: payload.taxId,
        contactEmail: payload.contactEmail,
        phone: payload.phone,
        website: payload.website,
        address: payload.address,
        city: payload.city,
      });
      return { ...user };
    }

    if (role === 'school') {
      return this.schoolRegistrationService.submitRegistration(payload);
    }

    throw new Error('Rol no soportado');
  }

  async login(email, password) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');
    const valid = this.userRepo.validatePassword(password, user.password_hash);
    if (!valid) throw new Error('Credenciales inválidas');

    const token = this.tokenService.sign({ userId: user.id, role: user.role });
    const base = { userId: user.id, role: user.role, email: user.email, token };

    if (user.role === 'STUDENT') {
      const student = await this.studentRepo.findByUserId(user.id);
      const verification = await this.verificationRepo.findLatestApproved(student.id);
      return { ...base, status: verification ? 'verified' : 'not_verified' };
    }

    return base;
  }

  async getProfile(userId, role) {
    const user = await this.userRepo.findById(userId);
    if (!user) return null;
    if (role === 'STUDENT') {
      const student = await this.studentRepo.findByUserId(userId);
      const verification = await this.verificationRepo.findLatestApproved(student.id);
      return {
        userId: user.id,
        role: user.role,
        email: user.email,
        status: verification ? 'verified' : 'not_verified',
        student,
      };
    }
    if (role === 'COMPANY') {
      const company = await this.companyRepo.findByUserId(userId);
      return { userId: user.id, role: user.role, email: user.email, company };
    }
    return { userId: user.id, role: user.role, email: user.email };
  }

  async updateProfile(userId, role, payload) {
    if (role === 'STUDENT') {
      await this.studentRepo.updateProfile(userId, payload);
    }
    if (role === 'COMPANY') {
      await this.companyRepo.updateProfile(userId, payload);
    }
  }
}
