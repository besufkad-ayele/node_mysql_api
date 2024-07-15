const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup

// GET /api/group-order-members
router.get('/', (req, res) => {
    db.connection.query('SELECT * FROM Group_order_members', (err, results) => {
        if (err) {
            console.error('Error fetching group order members:', err);
            return res.status(500).json({ error: 'Failed to fetch group order members' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No group order members found' });
        }

        res.json(results);
    });
});

// POST /api/group-order-members
router.post('/', (req, res) => {
    const groupOrderMemberData = req.body; // Assuming JSON payload with group order member data

    // Validate groupOrderMemberData
    if (!groupOrderMemberData.group_order_id || !groupOrderMemberData.user_id) {
        return res.status(400).json({ error: 'Group_order_id and user_id are required!' });
    }

    // Insert groupOrderMemberData into the database
    const sql = 'INSERT INTO Group_order_members (group_order_id, user_id) VALUES (?, ?)';
    const values = [groupOrderMemberData.group_order_id, groupOrderMemberData.user_id];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting group order member:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedGroupOrderMember = {
            group_order_member_id: result.insertId,
            group_order_id: groupOrderMemberData.group_order_id,
            user_id: groupOrderMemberData.user_id
        };

        res.json({ message: 'Group order member added successfully', group_order_member: insertedGroupOrderMember });
    });
});

module.exports = router;
