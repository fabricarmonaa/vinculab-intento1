import { pool } from '../config/database.js';

export class SchoolRepository {
  async createSchool({ name, directorName, cue, address, email, phone }, connection = pool) {
    const [result] = await connection.execute(
      `INSERT INTO schools (name, director_name, cue, address, email, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, directorName, cue, address, email, phone]
    );
    return { schoolId: result.insertId, name, directorName, cue, address, email, phone };
  }

  async findById(id, connection = pool) {
    const [rows] = await connection.execute('SELECT * FROM schools WHERE id = ?', [id]);
    return rows[0];
  }

  async findByUserId(userId, connection = pool) {
    const [rows] = await connection.execute('SELECT * FROM schools WHERE user_id = ?', [userId]);
    return rows[0];
  }

  async listAll() {
    const [rows] = await pool.execute('SELECT * FROM schools');
    return rows;
  }
}
