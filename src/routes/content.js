const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../services/middleware/authenticateToken');
const contentController = require('../controller/content_controller');

// GET /api/content
router.get('/', authenticateToken, contentController.getAllContent);

// POST /api/content
router.post('/', authenticateToken, contentController.addContent);

module.exports = router;
