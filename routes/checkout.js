const express = require('express');
const router = express.Router();
const CheckoutController = require('../controllers/CheckoutController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, CheckoutController.showCheckout);
router.post('/', isAuthenticated, CheckoutController.processCheckout);

module.exports = router;
