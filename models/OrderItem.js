const pool = require('../config/db');

class OrderItem {
  static async getByOrderId(orderId) {
    try {
      const [items] = await pool.query(
        `SELECT oi.*, p.name, p.image FROM order_items oi 
         LEFT JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [orderId]
      );
      return items;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const [result] = await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [data.order_id, data.product_id, data.quantity, data.price]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM order_items WHERE id = ?', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrderItem;
