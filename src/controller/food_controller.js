const db = require('../config/db');

exports.getAllFood = (req, res) => {
    db.connection.query('SELECT * FROM Food', (err, results) => {
        if (err) {
            console.error('Error fetching Food:', err);
            return res.status(500).json({ error: 'Failed to fetch food' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No food found' });
        }

        res.json(results);
    });
};

exports.getFoodById = (req, res) => {
    const foodId = req.params.id;
    db.connection.query('SELECT * FROM Food WHERE food_id = ?', [foodId], (err, results) => {
        if (err) {
            console.error('Error fetching Food:', err);
            return res.status(500).json({ error: 'Failed to fetch food' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.json(results[0]);
    });
};

exports.addFood = (req, res) => {
    const foodData = req.body;

    // Validate foodData
    if (!foodData.name || !foodData.category_id || !foodData.price || !foodData.content_id || !foodData.restaurant_id) {
        return res.status(400).json({ error: 'Name, category_id, price, content_id, and restaurant_id are required!' });
    }

    const sql = 'INSERT INTO Food (name, category_id, image, price, content_id, discount, restaurant_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [foodData.name, foodData.category_id, foodData.image || null, foodData.price, foodData.content_id, foodData.discount || 0, foodData.restaurant_id];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting Food:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedFood = {
            food_id: result.insertId,
            name: foodData.name,
            category_id: foodData.category_id,
            image: foodData.image || null,
            price: foodData.price,
            content_id: foodData.content_id,
            discount: foodData.discount || 0,
            restaurant_id: foodData.restaurant_id
        };

        res.json({ message: 'Food created successfully', food: insertedFood });
    });
};

exports.updateFood = (req, res) => {
    const foodId = req.params.id;
    const foodData = req.body;

    // Validate foodData
    if (!foodData.name && !foodData.category_id && !foodData.price && !foodData.content_id && !foodData.restaurant_id) {
        return res.status(400).json({ error: 'At least one of Name, category_id, price, content_id, and restaurant_id is required!' });
    }

    const sql = 'UPDATE Food SET ? WHERE food_id = ?';
    db.connection.query(sql, [foodData, foodId], (err, result) => {
        if (err) {
            console.error('Error updating Food:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.json({ message: 'Food updated successfully' });
    });
};

exports.deleteFood = (req, res) => {
    const foodId = req.params.id;

    db.connection.query('DELETE FROM Food WHERE food_id = ?', [foodId], (err, result) => {
        if (err) {
            console.error('Error deleting Food:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.json({ message: 'Food deleted successfully' });
    });
};
