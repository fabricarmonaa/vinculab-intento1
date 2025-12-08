import { AuthService } from '../services/AuthService.js';

const authService = new AuthService();

export async function getCurrentUserQuery(context) {
  const { userId, role } = context.user;
  return authService.getProfile(userId, role);
}
