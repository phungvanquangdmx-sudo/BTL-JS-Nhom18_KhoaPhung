const pool = require('../config/db');

class Product {
  static async getAll(page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit;
      const [products] = await pool.query(
        `SELECT p.*, c.name as category_name FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM products');
      
      return {
        products,
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
      const [products] = await pool.query(
        `SELECT p.*, c.name as category_name FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.id = ?`,
        [id]
      );
      return products[0];
    } catch (error) {
      throw error;
    }
  }

  static async getByCategory(categoryId, page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit;
      const [products] = await pool.query(
        `SELECT p.*, c.name as category_name FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.category_id = ? 
         ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        [categoryId, limit, offset]
      );

      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM products WHERE category_id = ?',
        [categoryId]
      );

      return {
        products,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
        currentPage: page
      };
    } catch (error) {
      throw error;
    }
  }

  static async getFeatured(limit = 8) {
    try {
      const [products] = await pool.query(
        `SELECT p.*, c.name as category_name FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.featured = TRUE 
         ORDER BY p.created_at DESC LIMIT ?`,
        [limit]
      );
      return products;
    } catch (error) {
      throw error;
    }
  }

  static async search(query, page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit;
      const searchQuery = `%${query}%`;
      
      const [products] = await pool.query(
        `SELECT p.*, c.name as category_name FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.name LIKE ? OR p.description LIKE ? 
         ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        [searchQuery, searchQuery, limit, offset]
      );

      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM products WHERE name LIKE ? OR description LIKE ?',
        [searchQuery, searchQuery]
      );

      return {
        products,
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
        `INSERT INTO products (name, description, price, discount_percent, category_id, image, stock, featured) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.name, data.description, data.price, data.discount_percent || 0, data.category_id, data.image, data.stock || 0, data.featured || false]
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
      if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
      if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
      if (data.discount_percent !== undefined) { fields.push('discount_percent = ?'); values.push(data.discount_percent); }
      if (data.category_id !== undefined) { fields.push('category_id = ?'); values.push(data.category_id); }
      if (data.image !== undefined) { fields.push('image = ?'); values.push(data.image); }
      if (data.stock !== undefined) { fields.push('stock = ?'); values.push(data.stock); }
      if (data.featured !== undefined) { fields.push('featured = ?'); values.push(data.featured); }

      values.push(id);

      const [result] = await pool.query(
        `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;
