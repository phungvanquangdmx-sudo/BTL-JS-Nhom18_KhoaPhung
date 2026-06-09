const pool = require('../config/db');

class Order {
  static async getAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const [orders] = await pool.query(
        'SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM orders');
      
      return {
        orders,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
        currentPage: page
      };
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
      return orders[0];
    } catch (error) {
      throw error;
    }
  }

  static async getByUserId(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const [orders] = await pool.query(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );

      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
        [userId]
      );

      return {
        orders,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
        currentPage: page
      };
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const [result] = await pool.query(
        'INSERT INTO orders (user_id, total_price, shipping_address, status) VALUES (?, ?, ?, ?)',
        [data.user_id, data.total_price, data.shipping_address, data.status || 'pending']
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const [result] = await pool.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [data.status, id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Order;
