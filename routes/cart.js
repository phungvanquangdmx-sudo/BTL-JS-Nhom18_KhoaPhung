const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');

router.get('/', CartController.showCart);
router.get('/count', CartController.getCartCount);
router.post('/add', CartController.addToCart);
router.post('/update', CartController.updateCart);
router.post('/remove', CartController.removeFromCart);
router.post('/clear', CartController.clearCart);

module.exports = router;
