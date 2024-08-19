const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken');
const groupOrderMembersController = require('../controller/groupMember_controller');

// GET /api/group-order-members
router.get('/', authenticateToken, groupOrderMembersController.getAllGroupOrderMembers);

// POST /api/group-order-members
router.post('/', authenticateToken, groupOrderMembersController.addGroupOrderMember);

module.exports = router;
