const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken');
const paymentsController = require('../controller/payment_controller');

// GET /api/payments
router.get('/', authenticateToken, paymentsController.getAllPayments);

// POST /api/payments
router.post('/', authenticateToken, paymentsController.createPayment);

module.exports = router;
