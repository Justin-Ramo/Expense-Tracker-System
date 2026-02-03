// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const argon2 = require('argon2');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'expense_tracker'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected...');
});




// User Registration (Sign Up)
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: 'Database query failed' });
            }
            if (results.length > 0) {
                return res.status(409).json({ error: 'Username or email already exists' });
            }

            argon2.hash(password).then(hashedPassword => {
                db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email], (err, results) => {
                    if (err) {
                        console.error("Database insert error:", err);
                        return res.status(500).json({ error: 'Failed to register user' });
                    }
                    res.status(201).json({ message: 'User  registered successfully' });
                });
            }).catch(err => {
                console.error("Password hashing error:", err);
                res.status(500).json({ error: 'Failed to hash password' });
            });
        });
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

// User Login (Sign In)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];
        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate a session ID
        const sessionId = uuidv4();
        res.json({ sessionId, message: 'Login successful' });
    });
});

// Middleware to protect routes
const authenticateSession = (req, res, next) => {
    const sessionId = req.headers['authorization'];
    if (sessionId) {
        req.sessionId = sessionId;
        next();
    } else {
        res.sendStatus(401);
    }
};

// Get all expenses
app.get('/api/expenses', authenticateSession, (req, res) => {
    db.query('SELECT * FROM expenses', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add a new expense
app.post('/api/expenses', authenticateSession, (req, res) => {
    const { description, amount, date } = req.body;
    db.query('INSERT INTO expenses (description, amount, date) VALUES (?, ?, ?)', [description, amount, date], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: results.insertId, description, amount, date });
    });
});

// Update an expense
app.put('/api/expenses/:id', authenticateSession, (req, res) => {
    const { id } = req.params;
    const { description, amount, date } = req.body;
    db.query('UPDATE expenses SET description = ?, amount = ?, date = ? WHERE id = ?', [description, amount, date, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Expense updated' });
    });
});

// Delete an expense
app.delete('/api/expenses/:id', authenticateSession, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM expenses WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Expense deleted' });
    });
});

// Example of a protected route
app.get('/api/protected', authenticateSession, (req, res) => {
    res.json({ message: 'This is a protected route', sessionId: req.sessionId });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});