import { pool } from '../config/database.js';

export class SchoolRegistrationRepository {
  async createRequest({ schoolName, directorName, cue, address, email, phone, status = 'PENDING' }) {
    const [result] = await pool.execute(
      `INSERT INTO school_registrations (school_name, director_name, cue, address, email, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [schoolName, directorName, cue, address, email, phone, status]
    );
    return { registrationId: result.insertId };
  }

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM school_registrations WHERE id = ?', [id]);
    return rows[0];
  }

  async listPending() {
    const [rows] = await pool.execute("SELECT * FROM school_registrations WHERE status = 'PENDING'");
    return rows;
  }

  async updateStatus(connection, id, status) {
    await connection.execute('UPDATE school_registrations SET status = ?, decided_at = NOW() WHERE id = ?', [status, id]);
  }
}
