import { pool } from '../config/database.js';

export class ApplicationRepository {
  async create({ studentId, offerId }, connection = pool) {
    const [result] = await connection.execute(
      `INSERT INTO applications (student_id, offer_id, status)
       VALUES (?, ?, 'SENT')`,
      [studentId, offerId]
    );
    return { applicationId: result.insertId };
  }

  async findById(id, connection = pool) {
    const [rows] = await connection.execute('SELECT * FROM applications WHERE id = ?', [id]);
    return rows[0];
  }

  async listByStudent(studentId, connection = pool) {
    const [rows] = await connection.execute(
      `SELECT a.id AS applicationId, a.status, a.created_at AS createdAt, o.title AS offerTitle, c.company_name AS companyName
       FROM applications a
       JOIN offers o ON o.id = a.offer_id
       JOIN companies c ON c.id = o.company_id
       WHERE a.student_id = ?
       ORDER BY a.created_at DESC`,
      [studentId]
    );
    return rows;
  }

  async listByOffer(offerId, connection = pool) {
    const [rows] = await connection.execute(
      `SELECT a.id AS applicationId, a.status, a.created_at AS createdAt,
              s.name AS studentName, s.last_name AS studentLastName, u.email AS studentEmail
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       WHERE a.offer_id = ?
       ORDER BY a.created_at DESC`,
      [offerId]
    );
    return rows.map((row) => ({
      ...row,
      studentName: `${row.studentName} ${row.studentLastName}`.trim(),
    }));
  }

  async updateStatus(connection, id, status) {
    await connection.execute('UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
  }
}
