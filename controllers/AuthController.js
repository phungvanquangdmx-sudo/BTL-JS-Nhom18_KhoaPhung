const User = require('../models/User');

class AuthController {
  // Show login page
  static async showLoginPage(req, res) {
    res.render('auth/login');
  }

  // Show register page
  static async showRegisterPage(req, res) {
    res.render('auth/register');
  }

  // Handle login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash('error', 'Email and password are required');
        return res.redirect('/auth/login');
      }

      const user = await User.verifyPassword(email, password);

      if (!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/auth/login');
      }

      // Set session
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.isAdmin = user.is_admin;

      req.flash('success', `Welcome back, ${user.name}!`);
      return res.redirect('/');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error logging in');
      return res.redirect('/auth/login');
    }
  }

  // Handle register
  static async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!name || !email || !password || !confirmPassword) {
        req.flash('error', 'All fields are required');
        return res.redirect('/auth/register');
      }

      if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match');
        return res.redirect('/auth/register');
      }

      if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters');
        return res.redirect('/auth/register');
      }

      // Check if user exists
      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        req.flash('error', 'Email already registered');
        return res.redirect('/auth/register');
      }

      await User.create({ name, email, password });

      req.flash('success', 'Account created successfully! Please login.');
      return res.redirect('/auth/login');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error registering');
      return res.redirect('/auth/register');
    }
  }

  // Handle logout
  static async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.redirect('/');
      }
      
      return res.redirect('/');
    });
  }
}

module.exports = AuthController;
