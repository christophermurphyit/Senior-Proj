const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS

// Load environment variables from db_cred.env
dotenv.config({ path: './db_cred.env' });

const app = express();
app.use(cors()); // Use CORS after initializing `app`
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

app.post('/createAccount', (req, res) => {
  const { email, username, password, favoriteLocation } = req.body;

  if (!email || !username || !password || !favoriteLocation) {
    return res.status(400).send("All fields are required.");
  }

  const checkSql = 'SELECT * FROM ACCOUNT_T WHERE username = ? OR user_email = ?';
  db.query(checkSql, [username, email], (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    if (results.length > 0) {
      return res.status(409).send("Username or email already exists.");
    }

    const insertSql = 'INSERT INTO ACCOUNT_T (user_email, username, user_password, favorite_location) VALUES (?, ?, ?, ?)';
    db.query(insertSql, [email, username, password, favoriteLocation], (err, result) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.status(201).send("Account created successfully");
    });
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
