import crypto from 'node:crypto';
import { pool } from '../config/database.js';

export class UserRepository {
  async createUser({ email, password, role }, connection = pool) {
    const passwordHash = this.hashPassword(password);
    const [result] = await connection.execute(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, role]
    );
    return { userId: result.insertId, email, role };
  }

  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${derived}`;
  }

  validatePassword(password, stored) {
    const [salt, hash] = stored.split(':');
    const derived = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === derived;
  }

  async findByEmail(email, connection = pool) {
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  async findById(id, connection = pool) {
    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  async updateEmail(userId, email) {
    await pool.execute('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
  }
}
