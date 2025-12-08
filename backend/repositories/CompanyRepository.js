import { pool } from '../config/database.js';

export class CompanyRepository {
  async createProfile({ userId, legalName, companyName, taxId, contactEmail, phone, website, address, city }, connection = pool) {
    await connection.execute(
      `INSERT INTO companies (user_id, legal_name, company_name, tax_id, contact_email, phone, website, address, city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, legalName, companyName, taxId, contactEmail, phone, website, address, city]
    );
    return this.findByUserId(userId);
  }

  async findByUserId(userId, connection = pool) {
    const [rows] = await connection.execute('SELECT * FROM companies WHERE user_id = ?', [userId]);
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
    await connection.execute(`UPDATE companies SET ${fields.join(', ')} WHERE user_id = ?`, values);
  }
}
