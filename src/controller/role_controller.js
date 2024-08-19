const db = require('../config/db');

// GET /api/users
exports.getAllRoles = (req, res) => {
    db.connection.query('SELECT * FROM role', (err, results) => {
        if (err) {
            console.error('Error fetching roles:', err);
            return res.status(500).json({ error: 'Failed to fetch roles' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No role found' });
        }

        res.json(results);
    });
};

// POST /api/role
exports.createRole = (req, res) => {
    const roleData = req.body;

    if (!roleData.role_name) {
        return res.status(400).json({ error: 'Role name required!' });
    }

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
};

// DELETE /api/role/:id
exports.deleteRole = (req, res) => {
    const roleId = req.params.id;

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
};

// PUT /api/role/:id
exports.updateRole = (req, res) => {
    const roleId = req.params.id;
    const roleData = req.body;

    if (!roleData.role_name) {
        return res.status(400).json({ error: 'Role name required!' });
    }

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
};
