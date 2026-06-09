const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/products/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Only images are allowed');
    }
  }
});

// Dashboard
router.get('/dashboard', isAdmin, AdminController.showDashboard);

// Products
router.get('/products', isAdmin, AdminController.showProducts);
router.get('/products/add', isAdmin, AdminController.showAddProductForm);
router.post('/products/add', isAdmin, upload.single('image'), AdminController.addProduct);
router.get('/products/edit/:id', isAdmin, AdminController.showEditProductForm);
router.post('/products/edit/:id', isAdmin, upload.single('image'), AdminController.updateProduct);
router.get('/products/delete/:id', isAdmin, AdminController.deleteProduct);

// Categories
router.get('/categories', isAdmin, AdminController.showCategories);
router.post('/categories/add', isAdmin, AdminController.addCategory);
router.get('/categories/delete/:id', isAdmin, AdminController.deleteCategory);
// Orders
router.get('/orders', isAdmin, AdminController.showOrders);
router.get('/orders/:orderId', isAdmin, AdminController.getOrderDetail);
router.post('/orders/:orderId/cancel', isAdmin, AdminController.cancelOrder);
module.exports = router;
