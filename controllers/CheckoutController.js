const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

class CheckoutController {
  // Show checkout page
  static async showCheckout(req, res) {
    try {
      const cart = req.session.cart || [];
      
      if (cart.length === 0) {
        req.flash('error', 'Your cart is empty');
        return res.redirect('/cart');
      }

      let total = 0;
      const cartItems = await Promise.all(cart.map(async (item) => {
        const product = await Product.getById(item.productId);
        const discountedPrice = product.price * (1 - product.discount_percent / 100);
        const itemTotal = discountedPrice * item.quantity;
        total += itemTotal;
        
        return {
          ...product,
          quantity: item.quantity,
          itemTotal: itemTotal,
          discountedPrice: discountedPrice
        };
      }));

      res.render('checkout/index', {
        cartItems: cartItems,
        total: total
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading checkout');
    }
  }

  // Process checkout
  static async processCheckout(req, res) {
    try {
      const { address, city, state, zipcode } = req.body;
      const cart = req.session.cart || [];
      const userId = req.session.userId;

      if (!userId) {
        req.flash('error', 'Please login first');
        return res.redirect('/login');
      }

      if (cart.length === 0) {
        req.flash('error', 'Your cart is empty');
        return res.redirect('/cart');
      }

      // Calculate total
      let total = 0;
      for (let item of cart) {
        const product = await Product.getById(item.productId);
        const discountedPrice = product.price * (1 - product.discount_percent / 100);
        total += discountedPrice * item.quantity;
      }

      const shippingAddress = `${address}, ${city}, ${state} ${zipcode}`;

      // Create order
      const orderResult = await Order.create({
        user_id: userId,
        total_price: total,
        shipping_address: shippingAddress,
        status: 'pending'
      });

      const orderId = orderResult.insertId;

      // Add order items
      for (let item of cart) {
        const product = await Product.getById(item.productId);
        const discountedPrice = product.price * (1 - product.discount_percent / 100);
        
        await OrderItem.create({
          order_id: orderId,
          product_id: item.productId,
          quantity: item.quantity,
          price: discountedPrice
        });
      }

      // Clear cart
      req.session.cart = [];

      req.flash('success', 'Order placed successfully!');
      res.redirect(`/orders/${orderId}`);
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error processing checkout');
      res.redirect('/checkout');
    }
  }
}

module.exports = CheckoutController;
