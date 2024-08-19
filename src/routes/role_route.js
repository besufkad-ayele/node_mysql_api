const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/authenticateToken');

const roleController = require('../controller/role_controller');

// GET /api/roles
router.get('/', authenticateToken,checkRole(1), roleController.getAllRoles);

// POST /api/roles
router.post('/', authenticateToken, roleController.createRole);

// DELETE /api/roles/:id
router.delete('/:id', authenticateToken, roleController.deleteRole);

// PUT /api/roles/:id
router.put('/:id', authenticateToken, roleController.updateRole);

module.exports = router;