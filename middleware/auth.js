// Auth Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  req.flash('error', 'Please login first');
  return res.redirect('/auth/login');
};

// Admin Middleware
const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  req.flash('error', 'Access denied');
  return res.redirect('/');
};

// Cart Middleware - Initialize cart in session
const initializeCart = (req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  res.locals.cart = req.session.cart;
  res.locals.cartCount = req.session.cart.length;
  next();
};

// Pass user info to locals
const userLocals = (req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.userName = req.session.userName || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  initializeCart,
  userLocals
};
