const Product = require('../models/Product');
const Category = require('../models/Category');

class ProductController {
  // Get all products with pagination
  static async getAllProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const result = await Product.getAll(page, 12);
      const categories = await Category.getAll();
      
      res.render('products/index', {
        products: result.products,
        categories: categories,
        searchQuery: undefined,
        selectedCategory: undefined,
        currentPage: result.currentPage,
        totalPages: result.pages,
        totalProducts: result.total
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading products');
    }
  }

  // Get products by category
  static async getByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const result = await Product.getByCategory(categoryId, page, 12);
      const categories = await Category.getAll();
      const selectedCategory = await Category.getById(categoryId);

      res.render('products/index', {
        products: result.products,
        categories: categories,
        selectedCategory: selectedCategory,
        searchQuery: undefined,
        currentPage: result.currentPage,
        totalPages: result.pages,
        totalProducts: result.total
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading products');
    }
  }

  // Search products
  static async searchProducts(req, res) {
    try {
      const { query } = req.query;
      const page = parseInt(req.query.page) || 1;
      
      if (!query) {
        return res.redirect('/products');
      }

      const result = await Product.search(query, page, 12);
      const categories = await Category.getAll();

      res.render('products/index', {
        products: result.products,
        categories: categories,
        searchQuery: query,
        selectedCategory: undefined,
        currentPage: result.currentPage,
        totalPages: result.pages,
        totalProducts: result.total
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error searching products');
    }
  }

  // Get product detail
  static async getProductDetail(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.getById(id);
      
      if (!product) {
        return res.status(404).send('Product not found');
      }

      res.render('products/detail', { product });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading product');
    }
  }
}

module.exports = ProductController;
