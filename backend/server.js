const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS

// Load environment variables from db_cred.env
dotenv.config({ path: __dirname + '/db_cred.env' });

const app = express();
app.use(cors()); // Use CORS after initializing `app`
app.use(express.json());

// ✅ FIXED: Removed duplicate `const db = mysql.createConnection({`
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306 // Use default 3306 if not specified
});

// ✅ FIXED: No unnecessary nesting, this part stays the same
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// =============================
//  GET /getFavoriteLocation
// =============================
app.get('/api/getFavoriteLocation', (req, res) => {
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

// =============================
//  POST /createAccount
// =============================
app.post('/api/createAccount', (req, res) => {
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

// =============================
//  POST /checkUserExists
// =============================
app.post('/api/checkUserExists', (req, res) => {
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

// =============================
//  POST /login
// =============================
app.post('/api/login', (req, res) => {
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

// =============================
//  GET /getAccountInfo
// =============================
app.get('/api/getAccountInfo', (req, res) => {
  const { usernameOrEmail } = req.query;
  if (!usernameOrEmail) {
    return res.status(400).json({ message: 'Username or email is required.' });
  }

  const sql = `
    SELECT user_email, username, favorite_location
    FROM ACCOUNT_T
    WHERE username = ? OR user_email = ?
    LIMIT 1
  `;
  db.query(sql, [usernameOrEmail, usernameOrEmail], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error occurred.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { user_email, username, favorite_location } = results[0];
    return res.status(200).json({
      email: user_email,
      username: username,
      favoriteLocation: favorite_location,
    });
  });
});

// =============================
//  PUT /updateAccount
// =============================
app.put('/api/updateAccount', (req, res) => {
  const {
    currentUsernameOrEmail,
    newEmail,
    newUsername,
    newFavoriteLocation,
    currentPassword,
    newPassword
  } = req.body;

  if (!currentUsernameOrEmail || !currentPassword) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const selectSql = `
    SELECT user_id, user_password, user_email, username, favorite_location
    FROM ACCOUNT_T
    WHERE (username = ? OR user_email = ?)
    LIMIT 1
  `;
  db.query(selectSql, [currentUsernameOrEmail, currentUsernameOrEmail], (err, results) => {
    if (err) {
      console.error('Error fetching user info:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = results[0];

    // Check password
    if (user.user_password !== currentPassword) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    // Only update changed fields
    const updateFields = [];
    const params = [];

    if (newEmail && newEmail.trim() !== '' && newEmail.trim() !== user.user_email) {
      updateFields.push('user_email = ?');
      params.push(newEmail.trim());
    }
    if (newUsername && newUsername.trim() !== '' && newUsername.trim() !== user.username) {
      updateFields.push('username = ?');
      params.push(newUsername.trim());
    }
    if (newFavoriteLocation && newFavoriteLocation.trim() !== '' 
        && newFavoriteLocation.trim() !== user.favorite_location) {
      updateFields.push('favorite_location = ?');
      params.push(newFavoriteLocation.trim());
    }

    // If newPassword is provided AND different from the old password
    if (newPassword && newPassword.trim() !== '' && newPassword.trim() !== user.user_password) {
      const passwordRegex = /^(?=.*\d).{6,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          message: 'Please choose a password with at least 6 characters including at least one number.'
        });
      }
      updateFields.push('user_password = ?');
      params.push(newPassword.trim());
    }

    // If nothing changed, skip
    if (updateFields.length === 0) {
      return res.status(200).json({ message: 'No changes submitted.' });
    }

    const updateSql = `
      UPDATE ACCOUNT_T
      SET ${updateFields.join(', ')}
      WHERE user_id = ?
    `;
    params.push(user.user_id);

    db.query(updateSql, params, (updateErr) => {
      if (updateErr) {
        console.error('Error updating account:', updateErr);
        return res.status(500).json({ message: 'Server error while updating account' });
      }
      return res.status(200).json({ message: 'Account updated successfully!' });
    });
  });
});

// =============================
//  PUT /updateUserLocation
// =============================
app.put('/api/updateUserLocation', (req, res) => {
  const { usernameOrEmail, newLocation } = req.body;

  if (!usernameOrEmail || !newLocation) {
    return res.status(400).json({ message: 'usernameOrEmail and newLocation are required.' });
  }

  const sql = `
    UPDATE ACCOUNT_T
    SET user_location = ?
    WHERE username = ? OR user_email = ?
  `;

  db.query(sql, [newLocation, usernameOrEmail, usernameOrEmail], (err, result) => {
    if (err) {
      console.error('Error updating user location:', err);
      return res.status(500).json({ message: 'Server error while updating user location.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or no changes made.' });
    }

    return res.status(200).json({ message: 'User location updated successfully.' });
  });
});
