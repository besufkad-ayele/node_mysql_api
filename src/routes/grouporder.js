const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../services/middleware/authenticateToken');
const groupOrderController = require('../controller/groupOrder_controller');

// GET /api/group-orders
router.get('/', authenticateToken, groupOrderController.getAllGroupOrders);
// GET /api/group-orders/:id
router.get('/detail/:id', authenticateToken, groupOrderController.getGroupOrderDetails);

// GET /api/grouporders/user/:userId
router.get('/users/:userId', authenticateToken, groupOrderController.getGroupOrdersByUser);

// POST /api/group-orders
router.post('/', authenticateToken, groupOrderController.addGroupOrder);


module.exports = router;
