const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/InvoiceController');

router.get('/:orderId/download', InvoiceController.downloadInvoice);

module.exports = router;