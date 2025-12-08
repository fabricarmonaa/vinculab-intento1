import { pool } from '../config/database.js';

export class OfferRepository {
  async createOffer({ companyId, title, description, requirements, salaryRange, specialty, status, location, modality }) {
    const [result] = await pool.execute(
      `INSERT INTO offers (company_id, title, description, requirements, salary_range, specialty, status, location, modality)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, title, description, requirements, salaryRange, specialty, status, location, modality]
    );
    return { offerId: result.insertId };
  }

  async updateOffer(offerId, payload) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(payload)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (fields.length === 0) return;
    values.push(offerId);
    await pool.execute(`UPDATE offers SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  async deleteOffer(offerId) {
    await pool.execute('DELETE FROM offers WHERE id = ?', [offerId]);
  }

  async findById(offerId) {
    const [rows] = await pool.execute(
      `SELECT o.*, c.company_name AS companyName
       FROM offers o
       JOIN companies c ON c.id = o.company_id
       WHERE o.id = ?`,
      [offerId]
    );
    return rows[0];
  }

  async listAll({ q, status }) {
    const conditions = [];
    const values = [];
    if (q) {
      conditions.push('o.title LIKE ?');
      values.push(`%${q}%`);
    }
    if (status) {
      conditions.push('o.status = ?');
      values.push(status);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT o.id AS offerId, o.title, o.status, o.description, o.requirements, o.salary_range AS salaryRange, o.specialty, o.location, o.modality,
              o.created_at AS createdAt, c.company_name AS companyName, c.id AS companyId
       FROM offers o
       JOIN companies c ON c.id = o.company_id
       ${where}
       ORDER BY o.created_at DESC`,
      values
    );
    return rows;
  }

  async listByCompany(companyId) {
    const [rows] = await pool.execute(
      `SELECT id AS offerId, title, status, description, salary_range AS salaryRange, specialty, location, modality, created_at AS createdAt
       FROM offers WHERE company_id = ? ORDER BY created_at DESC`,
      [companyId]
    );
    return rows;
  }
}
