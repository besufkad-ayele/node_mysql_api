const db = require('../config/db');

// POST /api/rating
const createRating = (req, res) => {
    const ratingData = req.body;

    // Validate ratingData
    if (!ratingData.user_id || !ratingData.restaurant_id || !ratingData.rating) {
        return res.status(400).json({ error: 'User_id, restaurant_id, and rating are required!' });
    }

    // Insert ratingData into the database
    const sql = 'INSERT INTO rating (user_id, restaurant_id, rating, review_message) VALUES (?, ?, ?, ?)';
    const values = [ratingData.user_id, ratingData.restaurant_id, ratingData.rating, ratingData.review_message || null];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting rating:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedRating = {
            rating_id: result.insertId,
            user_id: ratingData.user_id,
            restaurant_id: ratingData.restaurant_id,
            rating: ratingData.rating,
            review_message: ratingData.review_message || null
        };

        res.json({ message: 'Rating created successfully', rating: insertedRating });
    });
};

// GET /api/rating
const getAllRatings = (req, res) => {
    db.connection.query('SELECT * FROM rating', (err, results) => {
        if (err) {
            console.error('Error fetching rating:', err);
            return res.status(500).json({ error: 'Failed to fetch rating' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No rating found' });
        }

        res.json(results);
    });
};

// GET /api/rating/:id
const getRatingById = (req, res) => {
    const ratingId = req.params.id;
    const sql = 'SELECT * FROM rating WHERE rating_id = ?';

    db.connection.query(sql, [ratingId], (err, result) => {
        if (err) {
            console.error('Error fetching rating:', err);
            return res.status(500).json({ error: 'Failed to fetch rating' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        res.json(result[0]);
    });
};

// PUT /api/rating/:id
const updateRating = (req, res) => {
    const ratingId = req.params.id;
    const { user_id, restaurant_id, rating, review_message } = req.body;

    const sql = 'UPDATE rating SET user_id = ?, restaurant_id = ?, rating = ?, review_message = ? WHERE rating_id = ?';
    const values = [user_id, restaurant_id, rating, review_message || null, ratingId];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating rating:', err);
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: 'Rating updated successfully', affectedRows: result.affectedRows });
    });
};

// DELETE /api/rating/:id
const deleteRating = (req, res) => {
    const ratingId = req.params.id;
    const sql = 'DELETE FROM rating WHERE rating_id = ?';

    db.connection.query(sql, [ratingId], (err, result) => {
        if (err) {
            console.error('Error deleting rating:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        res.json({ message: 'Rating deleted successfully', affectedRows: result.affectedRows });
    });
};

module.exports = {
    createRating,
    getAllRatings,
    getRatingById,
    updateRating,
    deleteRating
};
