const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../services/middleware/authenticateToken');
const ordersController = require('../controller/order_controller');

// GET /api/orders
router.get('/', authenticateToken, ordersController.getAllOrders);

// GET /api/orders/:id
router.get('/:id', authenticateToken, ordersController.getOrderById);

// GET /api/orders/user/:id
router.get('/user/:id', authenticateToken, ordersController.getOrdersByUserId);

// POST /api/orders
router.post('/', authenticateToken, ordersController.createOrder);

// PUT /api/orders/:id
router.put('/:id', authenticateToken, ordersController.updateOrder);

// DELETE /api/orders/:id  
router.delete('/:id', authenticateToken, ordersController.deleteOrder);

module.exports = router;
