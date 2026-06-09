const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');



class InvoiceController {
  static async downloadInvoice(req, res) {
    let browser;
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
      
      // Render the invoice.ejs template with order data
      const invoicePath = path.join(__dirname, '../views/invoice/invoice.ejs');
      const htmlContent = await ejs.renderFile(invoicePath, { order, items });
      
      // Launch Puppeteer and generate PDF
      browser = await puppeteer.launch({ 
        headless: 'new',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
      const page = await browser.newPage();
      
      // Set timeout for page operations
      page.setDefaultTimeout(10000);
      page.setDefaultNavigationTimeout(10000);
      
      // Set content without waiting for external resources
      try {
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 8000 });
      } catch (contentError) {
        console.log('Content load timeout, proceeding with PDF generation:', contentError.message);
      }
      
      // Generate PDF
      const pdfBuffer = await page.pdf({ 
        format: 'A4', 
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });
      
      await browser.close();
      
      // Set response headers for PDF download
      res.setHeader('Content-Disposition', `attachment; filename=invoice_order_${order.id}.pdf`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send the PDF as the response using end() for binary data
      res.end(pdfBuffer);
    } catch (error) {
      console.error('Invoice generation error:', error);
      if (browser) {
        await browser.close();
      }
      res.status(500).send('Error generating invoice: ' + error.message);
    }
  }
}

module.exports = InvoiceController;
