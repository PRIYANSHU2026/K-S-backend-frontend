const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class ContactFormSubmission {
  static async create(data) {
    const id = uuidv4();
    const { user_name, user_email, user_phone, subject, message } = data;

    const query = `
      INSERT INTO contact_form_submissions
      (id, user_name, user_email, user_phone, subject, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [id, user_name, user_email, user_phone, subject, message]);
    return { id, ...data };
  }

  static async findAll(limit = 100, offset = 0) {
    const query = `
      SELECT * FROM contact_form_submissions
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;

    const [submissions] = await db.query(query, [limit, offset]);
    return submissions;
  }

  static async findById(id) {
    const query = `SELECT * FROM contact_form_submissions WHERE id = ?`;
    const [submissions] = await db.query(query, [id]);

    if (submissions.length === 0) {
      return null;
    }

    return submissions[0];
  }

  static async count() {
    const query = `SELECT COUNT(*) as total FROM contact_form_submissions`;
    const [result] = await db.query(query);
    return result[0].total;
  }

  static async delete(id) {
    const query = `DELETE FROM contact_form_submissions WHERE id = ?`;
    await db.query(query, [id]);
    return { id };
  }
}

module.exports = ContactFormSubmission;
