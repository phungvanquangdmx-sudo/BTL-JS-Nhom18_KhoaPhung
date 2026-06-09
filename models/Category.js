const pool = require('../config/db');

class Category {
  static async getAll() {
    try {
      const [categories] = await pool.query('SELECT * FROM categories');
      return categories;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [categories] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
      return categories[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const [result] = await pool.query(
        'INSERT INTO categories (name, description, image) VALUES (?, ?, ?)',
        [data.name, data.description, data.image]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const [result] = await pool.query(
        'UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?',
        [data.name, data.description, data.image, id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Category;
