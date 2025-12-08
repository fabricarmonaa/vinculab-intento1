import dotenv from 'dotenv';
import path from 'node:path';

const envPath = process.env.ENV_PATH || path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

export const env = {
  port: Number(process.env.PORT || 3000),
  apiPrefix: '/api/v1',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-demo-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'vinculab',
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
  },
  mail: {
    host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.MAIL_PORT || 2525),
    user: process.env.MAIL_USER || 'user',
    pass: process.env.MAIL_PASS || 'pass',
    from: process.env.MAIL_FROM || 'no-reply@vinculab.local'
  }
};
