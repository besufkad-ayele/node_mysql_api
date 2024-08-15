const db = require('../../config/db');

exports.getAllContent = (req, res) => {
    db.connection.query('SELECT * FROM Food_Content ', (err, results) => {
        if (err) {
            console.error('Error fetching Content:', err);
            return res.status(500).json({ error: 'Failed to fetch content' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No content found' });
        }

        res.json(results);
    });
};

exports.addContent = (req, res) => {
    const contentData = req.body;

    if (contentData.calories === undefined || contentData.protein === undefined || contentData.fat === undefined || contentData.is_spicy === undefined) {
        return res.status(400).json({ error: 'Calories, protein, fat, and is_spicy are required!' });
    }

    const sql = 'INSERT INTO Content (calories, protein, fat, is_spicy) VALUES (?, ?, ?, ?)';
    const values = [contentData.calories, contentData.protein, contentData.fat, contentData.is_spicy];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting Content:', err);
            return res.status(500).json({ error: err.message });
        }

        const insertedContent = {
            content_id: result.insertId,
            calories: contentData.calories,
            protein: contentData.protein,
            fat: contentData.fat,
            is_spicy: contentData.is_spicy
        };

        res.json({ message: 'Content created successfully', content: insertedContent });
    });
};
