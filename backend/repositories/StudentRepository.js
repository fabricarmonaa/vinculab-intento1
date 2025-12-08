import { pool } from '../config/database.js';

export class StudentRepository {
  async createProfile({ userId, name, lastName, dni, skills, description, cvUrl, schoolId }, connection = pool) {
    await connection.execute(
      `INSERT INTO students (user_id, name, last_name, dni, skills, description, cv_url, school_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, lastName, dni, skills, description, cvUrl, schoolId]
    );
    return this.findByUserId(userId);
  }

  async findByUserId(userId, connection = pool) {
    const [rows] = await connection.execute('SELECT * FROM students WHERE user_id = ?', [userId]);
    return rows[0];
  }

  async findById(id, connection = pool) {
    const [rows] = await connection.execute('SELECT * FROM students WHERE id = ?', [id]);
    return rows[0];
  }

  async updateProfile(userId, payload, connection = pool) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(payload)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (fields.length === 0) return;
    values.push(userId);
    await connection.execute(`UPDATE students SET ${fields.join(', ')} WHERE user_id = ?`, values);
  }
}
