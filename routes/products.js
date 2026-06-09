const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/category/:categoryId', ProductController.getByCategory);
router.get('/:id', ProductController.getProductDetail);

module.exports = router;
