const Category = require('../models/Category');

class HomeController {
  static async getHomePage(req, res) {
    try {
      const Product = require('../models/Product');
      
      const featuredProducts = await Product.getFeatured(8);
      const categories = await Category.getAll();
      const allProductsResult = await Product.getAll(1, 1000);
      const allProducts = allProductsResult.products || [];

      res.render('index', {
        featuredProducts,
        categories,
        allProducts
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading home page');
    }
  }
}

module.exports = HomeController;
