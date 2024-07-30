const db = require('../../config/db');

exports.getAllCategories = (req, res) => {
    db.connection.query('SELECT * FROM category', (err, results) => {
        if (err) {
            console.error('Error fetching category:', err);
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No category found' });
        }
        res.json(results);
    });
};

exports.deleteCategory = (req, res) => {
    const categoryId = req.params.id;

    const sql = 'DELETE FROM Category WHERE category_id = ?';
    db.connection.query(sql, [categoryId], (err, result) => {
        if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({ error: 'Failed to delete category' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    });
};

exports.updateCategory = (req, res) => {
    const categoryId = req.params.id;
    const categoryData = req.body;

    if (!categoryData.category_name || !categoryData.category_type) {
        return res.status(400).json({ error: 'Category name and type are required!' });
    }

    const sql = 'UPDATE Category SET ? WHERE category_id = ?';
    db.connection.query(sql, [categoryData, categoryId], (err, result) => {
        if (err) {
            console.error('Error updating category:', err);
            return res.status(500).json({ error: 'Failed to update category' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category updated successfully' });
    });
};

exports.addCategory = (req, res) => {
    const categoryData = req.body;

    if (!categoryData.category_name || !categoryData.category_type) {
        return res.status(400).json({ error: 'Category name and type are required!' });
    }

    const sql = 'INSERT INTO Category (category_name, category_type) VALUES (?, ?)';
    const values = [categoryData.category_name, categoryData.category_type];

    db.connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting category:', err);
            return res.status(500).json({ error: 'Failed to create category' });
        }

        const insertedCategory = {
            category_id: result.insertId,
            category_name: categoryData.category_name,
            category_type: categoryData.category_type
        };

        res.json({ message: 'Category created successfully', category: insertedCategory });
    });
};
