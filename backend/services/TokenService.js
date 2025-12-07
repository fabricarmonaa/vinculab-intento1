import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export class TokenService {
  constructor(secret = env.jwtSecret, expiresIn = env.jwtExpiresIn) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}
