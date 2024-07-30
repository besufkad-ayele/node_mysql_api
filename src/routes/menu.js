const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../services/middleware/authenticateToken');
const menuController = require('../controller/menu_controller');

// GET /api/menu
router.get('/', authenticateToken, menuController.getAllMenus);

// POST /api/menu
router.post('/', authenticateToken, menuController.addMenu);

module.exports = router;
