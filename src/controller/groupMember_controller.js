const db = require('../config/db');

exports.getAllGroupOrderMembers = (req, res) => {
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
};

exports.addGroupOrderMember = (req, res) => {
    const groupOrderMemberData = req.body;

    // Validate groupOrderMemberData
    if (!groupOrderMemberData.group_order_id || !groupOrderMemberData.user_id) {
        return res.status(400).json({ error: 'Group_order_id and user_id are required!' });
    }

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
};
