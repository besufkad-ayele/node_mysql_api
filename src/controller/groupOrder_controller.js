const db = require('../../config/db');

exports.getGroupOrderDetails = (req, res) => {
    const groupOrderId = req.params.id;

    const query = `
        SELECT
            go.group_order_id AS GroupOrderid,
            go.status,
            go.invitation_code,
            go.payment_method,
            go.payment_status,
            go.payment_type,
            go.total_amount,
            r.restaurant_id AS resturant_id,
            r.name AS restaurant_name,
            r.phone AS restaurant_phone,
            r.category_id AS restaurant_category_id,
            a.state AS restaurant_state,
            a.city AS restaurant_city,
            a.street AS restaurant_street,
            a.latitude AS restaurant_latitude,
            a.longitude AS restaurant_longitude,
            f.food_id AS food_id,
            f.name AS food_name,
            f.image AS food_image_url,
            f.price AS food_price,
            f.discount AS food_discount,
            f.content_id AS food_content_id,
            c.category_name AS food_category,
            u.user_id AS user_id,
            u.name AS user_name,
            u.email AS user_email,
            u.password AS user_password
        FROM
            Group_order go
        JOIN
            Restaurants r ON go.restaurant_id = r.restaurant_id
        JOIN
            Address a ON r.restaurant_id = a.restaurant_id
        JOIN
            Food f ON r.restaurant_id = f.restaurant_id
        JOIN
            Category c ON f.category_id = c.category_id
        JOIN
            Group_order_members gom ON go.group_order_id = gom.group_order_id
        JOIN
            Users u ON gom.user_id = u.user_id
        WHERE
            go.group_order_id = ?;
    `;

    db.connection.query(query, [groupOrderId], (err, results) => {
        console.log(results);
        if (err) {
            console.error('Error fetching group order details:', err);
            return res.status(500).json({ error: 'Failed to fetch group order details' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Group order not found' });
        }

        // Process results to match the desired structure
        const groupOrder = {
            GroupOrderid: results[0].GroupOrderid,
            //if results[0].name  is null print "Group order" else print results[0].name
            name: results[0].name ? results[0].name : "Group order",
            restaurant: {
                id: results[0].restaurant_id,
                name: results[0].restaurant_name,
                location: `${results[0].restaurant_state}, ${results[0].restaurant_city}, ${results[0].restaurant_street}`,
                rating: results[0].restaurant_rating, // Check if this field should be included or queried separately
                imageUrl: results[0].restaurant_image_url, // Check if this field should be included or queried separately
                category: { name: results[0].restaurant_category_name }, // Check if this field should be included or queried separately
                menu: results.filter(row => row.food_id).map(row => ({
                    id: row.food_id,
                    name: row.food_name,
                    isFavorite: false, // This might need to be updated based on your schema or user preferences
                    imageUrl: row.food_image_url,
                    description: row.food_description, // Check if this field should be included or queried separately
                    price: row.food_price,
                    calories: row.food_calories, // Check if this field should be included or queried separately
                    discount: row.food_discount,
                    category: { name: row.food_category }
                }))
            },
            members: results.filter(row => row.user_id).map(row => ({
                id: row.user_id,
                name: row.user_name,
                email: row.user_email,
                image: row.user_image,
                password: row.user_password,
                location: row.user_location
            })),
            selectedFoods: [], // Initialize with an empty list if not used
            createdAt: new Date() // Or fetch from the database if available
        };

        res.json(groupOrder);
    });
};
exports.getGroupOrdersByUser = (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT
            go.group_order_id AS GroupOrderid,
            go.status,
            go.group_name,
            go.invitation_code,
            go.payment_method,
            go.payment_status,
            go.payment_type,
            go.total_amount,
            go.created_at,
            u.user_id AS owner_user_id,
            u.name AS owner_user_name,
            u.email AS owner_user_email,
            gm.user_id AS member_user_id,
            mu.name AS member_user_name,
            mu.email AS member_user_email
        FROM
            Group_order go
        JOIN
            Users u ON go.group_owner_id = u.user_id
        LEFT JOIN
            Group_order_members gm ON go.group_order_id = gm.group_order_id
        LEFT JOIN
            Users mu ON gm.user_id = mu.user_id
        WHERE
            u.user_id = ? OR gm.user_id = ?;
    `;

    db.connection.query(query, [userId, userId], (err, results) => {
        if (err) {
            console.error('Error fetching group orders for user:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch group orders for user' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No group orders found for this user' });
        }

        const groupOrders = results.reduce((acc, row) => {
            const groupOrder = acc.find(go => go.GroupOrderid === row.GroupOrderid);

            if (!groupOrder) {
                acc.push({
                    GroupOrderid: row.GroupOrderid,
                    status: row.status,
                    groupName: row.group_name,
                    invitationCode: row.invitation_code,
                    paymentMethod: row.payment_method,
                    paymentStatus: row.payment_status,
                    paymentType: row.payment_type,
                    totalAmount: row.total_amount,
                    createdAt: row.created_at,
                    owner: {
                        user_id: row.owner_user_id,
                        name: row.owner_user_name,
                        email: row.owner_user_email
                    },
                    members: []
                });
            }

            if (row.member_user_id) {
                acc.find(go => go.GroupOrderid === row.GroupOrderid).members.push({
                    user_id: row.member_user_id,
                    name: row.member_user_name,
                    email: row.member_user_email
                });
            }

            return acc;
        }, []);

        res.json({
            success: true,
            message: 'Group orders found for this user',
            data: groupOrders
        });
    });
};


exports.getAllGroupOrders = (req, res) => {
    db.connection.query('SELECT * FROM Group_order', (err, results) => {
        if (err) {
            console.error('Error fetching group orders:', err);
            return res.status(500).json({ error: 'Failed to fetch group orders' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No group orders found' });
        }

        res.json(results);
    });
};

exports.addGroupOrder = (req, res) => {
    const groupOrderData = req.body;

    console.log(groupOrderData);

    // Validate groupOrderData
    if (!groupOrderData.restaurantId || !groupOrderData.GroupOrderid || !groupOrderData.status) {
        return res.status(400).json({ error: 'restaurantId, GroupOrderid, and status are required!' });
    }

    // Start a transaction
    db.connection.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ error: err.message });
        }

        // Insert into Group_order
        const sql = 'INSERT INTO Group_order (restaurant_id, group_owner_id, status, invitation_code, payment_method, payment_status, payment_type, total_amount, group_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [
            groupOrderData.restaurantId,
            groupOrderData.GroupOrderid,  // Use GroupOrderid instead of groupOwnerId
            groupOrderData.status,
            groupOrderData.invitation_code || null,
            groupOrderData.payment_method || null,
            groupOrderData.payment_status || null,
            groupOrderData.payment_type || null,
            groupOrderData.total_amount || null,
            groupOrderData.groupName || null,
            groupOrderData.createdAt || null 
        ];

        db.connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting group order:', err);
                return db.connection.rollback(() => {
                    res.status(500).json({ error: err.message });
                });
            }

            const groupOrderId = result.insertId;

            // Insert the group owner into Group_order_members
            const insertMemberSql = 'INSERT INTO Group_order_members (group_order_id, user_id) VALUES (?, ?)';
            const insertMemberValues = [groupOrderId, groupOrderData.GroupOrderid];

            db.connection.query(insertMemberSql, insertMemberValues, (err) => {
                if (err) {
                    console.error('Error inserting group owner into Group_order_members:', err);
                    return db.connection.rollback(() => {
                        res.status(500).json({ error: err.message });
                    });
                }

                // Commit the transaction
                db.connection.commit(err => {
                    if (err) {
                        console.error('Error committing transaction:', err);
                        return db.connection.rollback(() => {
                            res.status(500).json({ error: err.message });
                        });
                    }

                    const insertedGroupOrder = {
                        group_order_id: groupOrderId,
                        restaurant_id: groupOrderData.restaurantId,
                        group_owner_id: groupOrderData.GroupOrderid,  // Use GroupOrderid instead of groupOwnerId
                        status: groupOrderData.status,
                        invitation_code: groupOrderData.invitation_code || null,
                        payment_method: groupOrderData.payment_method || null,
                        payment_status: groupOrderData.payment_status || null,
                        payment_type: groupOrderData.payment_type || null,
                        total_amount: groupOrderData.total_amount || null
                    };

                    res.json({ message: 'Group order created successfully', group_order: insertedGroupOrder });
                });
            });
        });
    });
};


