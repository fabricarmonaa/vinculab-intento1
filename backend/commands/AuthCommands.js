import fs from 'node:fs';
import path from 'node:path';
import { AuthService } from '../services/AuthService.js';
import { TokenService } from '../services/TokenService.js';
import { StudentRepository } from '../repositories/StudentRepository.js';

const authService = new AuthService();
const tokenService = new TokenService();
const studentRepo = new StudentRepository();

export async function registerCommand(body) {
  return authService.register(body);
}

export async function loginCommand(body) {
  const result = await authService.login(body.email, body.password);
  return result;
}

export async function updateProfileCommand(context, body) {
  await authService.updateProfile(context.user.userId, context.user.role, body);
  return { message: 'Perfil actualizado' };
}

export async function uploadCvCommand(context, body) {
  const student = await studentRepo.findByUserId(context.user.userId);
  if (!student) throw new Error('Estudiante no encontrado');
  if (!body.cv || !body.cv.path) throw new Error('Archivo no provisto');
  const targetDir = path.join('uploads', 'cvs');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, path.basename(body.cv.path));
  fs.renameSync(body.cv.path, targetPath);
  await studentRepo.updateProfile(context.user.userId, { cv_url: targetPath });
  return { message: 'CV cargado', path: targetPath };
}

export function verifyTokenCommand(token) {
  return tokenService.verify(token);
}
