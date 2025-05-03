const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Content {
  static async findAll() {
    const query = `SELECT * FROM website_content`;
    const [contents] = await db.query(query);
    return contents;
  }

  static async findBySection(section) {
    const query = `SELECT * FROM website_content WHERE section = ?`;
    const [contents] = await db.query(query, [section]);

    if (contents.length === 0) {
      return null;
    }

    return contents[0];
  }

  static async findById(id) {
    const query = `SELECT * FROM website_content WHERE id = ?`;
    const [contents] = await db.query(query, [id]);

    if (contents.length === 0) {
      return null;
    }

    return contents[0];
  }

  static async update(id, data) {
    const { title, content, metadata } = data;

    const query = `
      UPDATE website_content
      SET
        title = ?,
        content = ?,
        metadata = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const metadataStr = typeof metadata === 'object' ? JSON.stringify(metadata) : metadata;

    await db.query(query, [title, content, metadataStr, id]);
    return { id, ...data };
  }

  static async create(data) {
    const id = uuidv4();
    const { section, title, content, metadata } = data;

    const query = `
      INSERT INTO website_content
      (id, section, title, content, metadata)
      VALUES (?, ?, ?, ?, ?)
    `;

    const metadataStr = typeof metadata === 'object' ? JSON.stringify(metadata) : metadata;

    await db.query(query, [id, section, title, content, metadataStr]);
    return { id, ...data };
  }

  static async delete(id) {
    const query = `DELETE FROM website_content WHERE id = ?`;
    await db.query(query, [id]);
    return { id };
  }
}

module.exports = Content;
