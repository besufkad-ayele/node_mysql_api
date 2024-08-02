
const express = require('express');
const db = require('../config/db');
const routes = require('./routes/insert');
db.createTablesIfNotExist();
const app = express();


// Middleware
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', routes); // Mount routes under /api

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
