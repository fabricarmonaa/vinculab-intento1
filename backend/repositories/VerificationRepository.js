import { pool } from '../config/database.js';

export class VerificationRepository {
  async createRequest({ studentId, schoolId, status = 'PENDING' }, connection = pool) {
    const [result] = await connection.execute(
      `INSERT INTO verifications (student_id, school_id, status)
       VALUES (?, ?, ?)`,
      [studentId, schoolId, status]
    );
    return { verificationId: result.insertId };
  }

  async findActiveForStudent(studentId, connection = pool) {
    const [rows] = await connection.execute(
      "SELECT * FROM verifications WHERE student_id = ? AND status = 'PENDING'",
      [studentId]
    );
    return rows[0];
  }

  async findLatestApproved(studentId, connection = pool) {
    const [rows] = await connection.execute(
      "SELECT * FROM verifications WHERE student_id = ? AND status = 'APPROVED' ORDER BY decided_at DESC LIMIT 1",
      [studentId]
    );
    return rows[0];
  }

  async findById(id, connection = pool) {
    const [rows] = await connection.execute('SELECT * FROM verifications WHERE id = ?', [id]);
    return rows[0];
  }

  async listByStudent(studentId, connection = pool) {
    const [rows] = await connection.execute('SELECT * FROM verifications WHERE student_id = ? ORDER BY created_at DESC', [studentId]);
    return rows;
  }

  async listPendingBySchool(schoolId, connection = pool) {
    const [rows] = await connection.execute(
      `SELECT v.id AS verificationId, v.created_at AS createdAt, CONCAT(st.name, ' ', st.last_name) AS studentName, u.email AS studentEmail
       FROM verifications v
       JOIN students st ON st.id = v.student_id
       JOIN users u ON u.id = st.user_id
       WHERE v.school_id = ? AND v.status = 'PENDING'
       ORDER BY v.created_at DESC`,
      [schoolId]
    );
    return rows;
  }

  async listApprovedBySchool(schoolId, connection = pool) {
    const [rows] = await connection.execute(
      `SELECT v.id AS verificationId, v.decided_at AS decidedAt, CONCAT(st.name, ' ', st.last_name) AS studentName, u.email AS studentEmail, v.created_at AS createdAt
       FROM verifications v
       JOIN students st ON st.id = v.student_id
       JOIN users u ON u.id = st.user_id
       WHERE v.school_id = ? AND v.status = 'APPROVED'
       ORDER BY v.decided_at DESC`,
      [schoolId]
    );
    return rows;
  }

  async updateStatus(connection, id, status) {
    await connection.execute('UPDATE verifications SET status = ?, decided_at = NOW() WHERE id = ?', [status, id]);
  }
}
