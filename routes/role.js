const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup
const authenticateToken = require('../middleware/authenticateToken');

// GET /api/users
router.get('/',authenticateToken,(req, res) => {
    // Assuming you have a function in your db module to fetch all users
    db.connection.query('SELECT * FROM role', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        // If no users found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No role found' });
        }

        // If users found, return them
        res.json(results);
    });
});
// POST /api/role
// we can but no need to create the role
router.post('/',authenticateToken, (req, res) => {
    const roleData = req.body; // Assuming JSON payload

    // Validate roleData
    if (!roleData.role_name) {
        return res.status(400).json({ error: 'Role name required!' });
    }

    // Example: Insert roleData into the database
    const sql = 'INSERT INTO role (role_name) VALUES (?)';
    const values = [roleData.role_name];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting role:', err);
            return res.status(500).json({ error: 'Failed to create role' });
        }

        const insertedRole = {
            role_id: result.insertId,
            role_name: roleData.role_name
        };

        res.json({ message: 'Role created successfully', role: insertedRole });
    });
});
//delete role by id  //not needed now but incase if needed we can use this  
// DELETE /api/role/:id
router.delete('/:id',authenticateToken,(req, res) => {
    const roleId = req.params.id;

    // Delete role from the database
    const sql = 'DELETE FROM role WHERE role_id = ?';
    db.connection.query(sql, [roleId], (err, result) => {
        if (err) {
            console.error('Error deleting role:', err);
            return res.status(500).json({ error: 'Failed to delete role' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.json({ message: 'Role deleted successfully' });
    });
});
//here we can add the update delete method but once created no need to update or delete the role
// PUT /api/role/:id
// we can but no need to update the role
router.put('/:id', (req, res) => {
    const roleId = req.params.id;
    const roleData = req.body; // Assuming JSON payload

    // Validate roleData
    if (!roleData.role_name) {
        return res.status(400).json({ error: 'Role name required!' });
    }

    // Update roleData in the database
    const sql = 'UPDATE role SET ? WHERE role_id = ?';
    db.connection.query(sql, [roleData, roleId], (err, result) => {
        if (err) {
            console.error('Error updating role:', err);
            return res.status(500).json({ error: 'Failed to update role' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.json({ message: 'Role updated successfully' });
    });
});
// still it is available only for the admin
module.exports = router;
