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
  port: 3306 // Set the database port to 3306
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

app.get('/getFavoriteLocation', (req, res) => {
  const { usernameOrEmail } = req.query;

  if (!usernameOrEmail) {
    return res.status(400).json({ message: "Username or email is required." });
  }

  const sql = 'SELECT favorite_location FROM ACCOUNT_T WHERE username = ? OR user_email = ?';
  db.query(sql, [usernameOrEmail, usernameOrEmail], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error occurred." });
    }

    if (results.length > 0) {
      res.status(200).json({ favoriteLocation: results[0].favorite_location });
    } else {
      res.status(404).json({ message: "User not found or no favorite location set." });
    }
  });
});


app.post('/createAccount', (req, res) => {
  const { email, username, password, favoriteLocation } = req.body;

  if (!email || !username || !password || !favoriteLocation) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Email validation
  if (!email.includes('@')) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  // Password validation
  const passwordRegex = /^(?=.*\d).{6,}$/; // At least 6 characters and at least one number
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: "Please enter a Password with at least 6 characters including at least one number."
    });
  }

  const checkSql = 'SELECT * FROM ACCOUNT_T WHERE username = ? OR user_email = ?';
  db.query(checkSql, [username, email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "Username or email already exists." });
    }

    const insertSql = 'INSERT INTO ACCOUNT_T (user_email, username, user_password, favorite_location) VALUES (?, ?, ?, ?)';
    db.query(insertSql, [email, username, password, favoriteLocation], (err) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      console.log("Insert successful. Sending 201 response...");
      try {
        res.status(201).json({ message: "Account created successfully" });
        console.log("201 response sent to client.");
      } catch (error) {
        console.error("Error while sending 201 response:", error);
      }
    });
  });
});

app.post('/checkUserExists', (req, res) => {
  const { email, username, password, favoriteLocation } = req.body;

  if (!email || !username || !password || !favoriteLocation) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const checkSql = `SELECT * FROM ACCOUNT_T 
                    WHERE user_email = ? 
                    AND username = ? 
                    AND user_password = ? 
                    AND favorite_location = ?`;

  db.query(checkSql, [email, username, password, favoriteLocation], (err, results) => {
    if (err) {
      console.error("Database error during check:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      return res.status(200).json({ exists: true, message: "User exists in the database." });
    } else {
      return res.status(404).json({ exists: false, message: "User not found in the database." });
    }
  });
});



app.post('/login', (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).send("Username/email and password are required.");
  }

  const sql = 'SELECT * FROM ACCOUNT_T WHERE (username = ? OR user_email = ?) AND user_password = ?';
  db.query(sql, [usernameOrEmail, usernameOrEmail, password], (err, results) => {
    if (err) {
      return res.status(500).send("Server error occurred.");
    }

    if (results.length > 0) {
      const userId = results[0].user_id;

      // Update the latest_login_timestamp
      const updateSql = 'UPDATE ACCOUNT_T SET latest_login_timestamp = NOW() WHERE user_id = ?';
      db.query(updateSql, [userId], (updateErr) => {
        if (updateErr) {
          console.error('Error updating login timestamp:', updateErr);
          // You may choose to handle this error differently
          return res.status(500).send("Server error occurred while updating login timestamp.");
        }

        // Return username in JSON format
        res.status(200).json({ message: "Login successful", username: results[0].username });
      });
    } else {
      res.status(401).send("Invalid credentials");
    }
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
