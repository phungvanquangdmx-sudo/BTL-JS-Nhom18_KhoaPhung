const Product = require('../models/Product');

class CartController {
  // Show cart page
  static async showCart(req, res) {
    try {
      const cart = req.session.cart || [];
      let total = 0;

      // Fetch product details for each cart item
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

      res.render('cart/index', {
        cartItems: cartItems,
        total: total,
        cartCount: cart.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading cart');
    }
  }

  // Add to cart
  static async addToCart(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;
      const cart = req.session.cart || [];

      // Check if product exists
      const product = await Product.getById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if item already in cart
      const existingItem = cart.find(item => item.productId == productId);
      
      if (existingItem) {
        existingItem.quantity += parseInt(quantity);
      } else {
        cart.push({
          productId: productId,
          quantity: parseInt(quantity)
        });
      }

      req.session.cart = cart;
      res.json({ success: true, cartCount: cart.length, message: 'Added to cart' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error adding to cart' });
    }
  }

  // Update cart item quantity
  static async updateCart(req, res) {
    try {
      const { productId, quantity } = req.body;
      const cart = req.session.cart || [];
      const qty = parseInt(quantity);

      if (qty <= 0) {
        // Remove item
        req.session.cart = cart.filter(item => item.productId != productId);
      } else {
        const item = cart.find(item => item.productId == productId);
        if (item) {
          item.quantity = qty;
        }
      }

      res.json({ success: true, cartCount: req.session.cart.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating cart' });
    }
  }

  // Remove from cart
  static async removeFromCart(req, res) {
    try {
      const { productId } = req.body;
      const cart = req.session.cart || [];
      
      req.session.cart = cart.filter(item => item.productId != productId);
      
      res.json({ success: true, cartCount: req.session.cart.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error removing from cart' });
    }
  }

  // Clear cart
  static async clearCart(req, res) {
    req.session.cart = [];
    res.json({ success: true });
  }

  // Get cart count
  static async getCartCount(req, res) {
    try {
      const cart = req.session.cart || [];
      res.json({ success: true, count: cart.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error getting cart count' });
    }
  }
}

module.exports = CartController;
