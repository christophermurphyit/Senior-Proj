const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from db_cred.env
dotenv.config({ path: './db_cred.env' });

const app = express();
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
  const { username, password } = req.body;
  const sql = 'INSERT INTO ACCOUNT_T (username, user_password) VALUES (?, ?)';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(201).send('Account created');
    }
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
