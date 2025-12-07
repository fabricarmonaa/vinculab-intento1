import { TokenService } from '../services/TokenService.js';
import { sendJson } from '../utils/response.js';

const tokenService = new TokenService();

export function requireAuth(handler) {
  return async (req, res, context) => {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      return sendJson(res, 401, { message: 'Unauthorized' });
    }
    try {
      const token = auth.replace('Bearer ', '');
      const payload = tokenService.verify(token);
      context.user = payload;
      return handler(req, res, context);
    } catch (error) {
      return sendJson(res, 401, { message: 'Invalid token' });
    }
  };
}
