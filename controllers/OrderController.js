const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

class OrderController {
  // Get user's orders
  static async getUserOrders(req, res) {
    try {
      const userId = req.session.userId;
      const page = parseInt(req.query.page) || 1;
      
      const result = await Order.getByUserId(userId, page, 10);

      res.render('orders/index', {
        orders: result.orders,
        currentPage: result.currentPage,
        totalPages: result.pages
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading orders');
    }
  }

  // Get order details
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

      res.render('orders/detail', {
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
      res.redirect(`/orders`);

    }catch(error){
      console.log(error);
      req.flash('error', 'Có lỗi xảy ra khi hủy đơn hàng');
      res.redirect(`/orders`);
    }
    
}}

module.exports = OrderController;
