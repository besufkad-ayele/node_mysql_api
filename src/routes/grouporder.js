const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../services/middleware/authenticateToken');
const groupOrderController = require('../controller/groupOrder_controller');

// GET /api/group-orders
router.get('/', authenticateToken, groupOrderController.getAllGroupOrders);

// POST /api/group-orders
router.post('/', authenticateToken, groupOrderController.addGroupOrder);

module.exports = router;
