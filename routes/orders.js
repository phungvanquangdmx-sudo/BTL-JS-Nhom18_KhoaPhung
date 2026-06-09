const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, OrderController.getUserOrders);
router.get('/:orderId', isAuthenticated, OrderController.getOrderDetail);
router.post('/:orderId/cancel', isAuthenticated, OrderController.cancelOrder);
module.exports = router;
