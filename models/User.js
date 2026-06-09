const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async getAll() {
    try {
      const [users] = await pool.query('SELECT id, name, email, phone, is_admin, created_at FROM users');
      return users;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [users] = await pool.query(
        'SELECT id, name, email, phone, address, city, state, zipcode, is_admin, created_at FROM users WHERE id = ?',
        [id]
      );
      return users[0];
    } catch (error) {
      throw error;
    }
  }

  static async getByEmail(email) {
    try {
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return users[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [data.name, data.email, hashedPassword]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const fields = [];
      const values = [];
      
      if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
      if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
      if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
      if (data.city !== undefined) { fields.push('city = ?'); values.push(data.city); }
      if (data.state !== undefined) { fields.push('state = ?'); values.push(data.state); }
      if (data.zipcode !== undefined) { fields.push('zipcode = ?'); values.push(data.zipcode); }

      if (fields.length === 0) return { affectedRows: 0 };

      values.push(id);

      const [result] = await pool.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async verifyPassword(email, password) {
    try {
      const user = await this.getByEmail(email);
      if (!user) return null;
      
      const isMatch = await bcrypt.compare(password, user.password);
      return isMatch ? user : null;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
