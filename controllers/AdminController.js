const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs').promises;
const path = require('path');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
class AdminController {
  // Dashboard
  static async showDashboard(req, res) {
    try {
      const productsTotal = (await Product.getAll()).total
      const ordersTotal = (await (Order.getAll())).total;
      res.render('admin/dashboard', {orderTotal : ordersTotal, productTotal: productsTotal});
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading dashboard');
    }
  }

  // Products Management
  static async showProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const searchQuery = req.query.search || '';
      
      let result;
      if (searchQuery.trim()) {
        result = await Product.search(searchQuery, page, 20);
      } else {
        result = await Product.getAll(page, 20);
      }
      
      res.render('admin/products/index', {
        products: result.products,
        currentPage: result.currentPage,
        totalPages: result.pages,
        searchQuery: searchQuery
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading products');
    }
  }

  // Show add product form
  static async showAddProductForm(req, res) {
    try {
      const categories = await Category.getAll();
      res.render('admin/products/add', { categories });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading form');
    }
  }

  // Add product
  static async addProduct(req, res) {
    try {
      const { name, description, price, discount_percent, category_id, stock, featured } = req.body;
      
      let image = 'products/default.jpg';
      if (req.file) {
        image = `products/${req.file.filename}`;
      }

      await Product.create({
        name,
        description,
        price: parseFloat(price),
        discount_percent: parseInt(discount_percent) || 0,
        category_id: parseInt(category_id),
        image,
        stock: parseInt(stock) || 0,
        featured: featured === 'on'
      });

      req.flash('success', 'Product added successfully');
      res.redirect('/admin/products');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error adding product');
      res.redirect('/admin/products/add');
    }
  }

  // Show edit product form
  static async showEditProductForm(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.getById(id);
      const categories = await Category.getAll();

      if (!product) {
        return res.status(404).send('Product not found');
      }

      res.render('admin/products/edit', { product, categories });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading form');
    }
  }

  // Update product
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, discount_percent, category_id, stock, featured } = req.body;
      
      const updateData = {
        name,
        description,
        price: parseFloat(price),
        discount_percent: parseInt(discount_percent) || 0,
        category_id: parseInt(category_id),
        stock: parseInt(stock) || 0,
        featured: featured === 'on'
      };

      if (req.file) {
        updateData.image = `products/${req.file.filename}`;
      }

      await Product.update(id, updateData);

      req.flash('success', 'Product updated successfully');
      res.redirect('/admin/products');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error updating product');
      res.redirect('/admin/products');
    }
  }

  // Delete product
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      await Product.delete(id);

      req.flash('success', 'Product deleted successfully');
      res.redirect('/admin/products');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error deleting product');
      res.redirect('/admin/products');
    }
  }

  // Categories Management
  static async showCategories(req, res) {
    try {
      const categories = await Category.getAll();
      res.render('admin/categories/index', { categories });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading categories');
    }
  }

  // Add category
  static async addCategory(req, res) {
    try {
      const { name, description } = req.body;
      
      await Category.create({
        name,
        description,
        image: 'categories/default.jpg'
      });

      req.flash('success', 'Category added successfully');
      res.redirect('/admin/categories');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error adding category');
      res.redirect('/admin/categories');
    }
  }

  // Delete category
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      
      await Category.delete(id);

      req.flash('success', 'Category deleted successfully');
      res.redirect('/admin/categories');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error deleting category');
      res.redirect('/admin/categories');
    }
  }
  static async showOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      
      const result = await Order.getAll(page, 10);

      res.render('admin/orders/index', {
        orders: result.orders,
        currentPage: result.currentPage,
        totalPages: result.pages
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading orders');
    }
  }
  static async getOrderDetail(req, res) {
    try {
      const { orderId } = req.params;
      const order = await Order.getById(orderId);

      if (!order) {
        return res.status(404).send('Order not found');
      }

      // Check if order belongs to user
      if (order.user_id != req.session.userId && !req.session.isAdmin) {
        return res.status(403).send('Access denied');
      }

      const items = await OrderItem.getByOrderId(orderId);

      res.render('admin/orders/detail', {
        order: order,
        items: items
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading order');
    }
  }
  static async cancelOrder(req, res) {
    try{
      const {orderId} = req.params;
      const order = await Order.getById(orderId);
      console.log(order);

      if(order.user_id != req.session.userId && !req.session.isAdmin){
        return res.status(403).send('Access denied');
      }
      
      if(order.status !== 'pending'){
        return res.status(400).send("Only pending orders can be cancelled");
      }
      const result = await Order.delete(orderId);
      if (!result) {
        return res.status(400).send("Error cancelling order");
      }
      req.flash('success', 'Hủy đơn hàng thành công');

      res.redirect(`/admin/orders`);

    }catch(error){
      console.log(error);
      req.flash('error', 'Có lỗi xảy ra khi hủy đơn hàng');
      res.redirect(`/admin/orders`);
    }
    
}
}

module.exports = AdminController;
