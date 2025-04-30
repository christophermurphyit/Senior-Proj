// server.js

// Import required modules
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./utils/authMiddleware');
const bcrypt = require('bcrypt');

// Create the Express app
const app = express();

// Load environment variables from db_cred.env (for local development).
// In production, these variables should be set via EB configuration and the db_cred.env file will not be deployed.
dotenv.config({ path: __dirname + '/process.env' });

// Middleware configuration
app.use(cors());
app.use(express.json());

// *********************
// DATABASE CONNECTION
// *********************
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// *********************
// API ENDPOINTS
// (All API routes are prefixed with /api)
// *********************

// Weather endpoint
app.get('/api/weather', async (req, res) => {
  const { city, lat, lon } = req.query;
  if (!city && (!lat || !lon)) {
    return res.status(400).json({ message: 'City or latitude/longitude required.' });
  }
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    let weatherUrl = '';
    if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=imperial&appid=${apiKey}`;
    } else {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    }
    const weatherResponse = await axios.get(weatherUrl);
    res.status(200).json(weatherResponse.data);
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    res.status(500).json({ message: 'Failed to fetch weather data.' });
  }
});

// Forecast endpoint
app.get('/api/forecast', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and longitude are required.' });
  }

  try {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      return res.status(400).json({ message: 'Invalid coordinates.' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const exclude = 'minutely,alerts'; // ✅ customize this if needed
    const forecastUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${parsedLat}&lon=${parsedLon}&exclude=${exclude}&units=imperial&appid=${apiKey}`;

    console.log('Forecast URL:', forecastUrl);

    const forecastResponse = await axios.get(forecastUrl);
    res.status(200).json(forecastResponse.data);
  } catch (error) {
    console.error('Error fetching forecast:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to fetch forecast data.',
      error: error.response?.data || error.message,
    });
  }
});


/********************************************************************
 * Account endpoints
 ********************************************************************/

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

// Create account endpoint with password hashing
app.post('/api/createAccount', async (req, res) => {
  const { email, username, password, favoriteLocation } = req.body;
  if (!email || !username || !password || !favoriteLocation) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  const passwordRegex = /^(?=.*\d).{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: "Please enter a Password with at least 6 characters including at least one number."
    });
  }
  const checkSql = 'SELECT * FROM ACCOUNT_T WHERE username = ? OR user_email = ?';


  db.query(checkSql, [username, email], async (err, results) => {
    if (err) {
      console.error("DB error during insert:", err); 
      return res.status(500).json({ message: err.message });
    }
    if (results.length > 0) {
      return res.status(409).json({ message: "Username or email already exists." });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertSql = `
        INSERT INTO ACCOUNT_T (user_email, username, user_password, favorite_location)
        VALUES (?, ?, ?, ?)
      `;
      db.query(insertSql, [email, username, hashedPassword, favoriteLocation], (insertErr) => {
        if (insertErr) {
          console.error("DB error during insert:", insertErr); 
          return res.status(500).json({ message: insertErr.message });
        }
        console.log("Insert successful. Sending 201 response...");
        res.status(201).json({ message: "Account created successfully" });
      });
    } catch (hashError) {
      console.error("Error while hashing password:", hashError);
      return res.status(500).json({ message: "Error hashing password." });
    }
  });
});

// Check user exists endpoint (for verification)
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

// Login endpoint (with bcrypt password comparison)
app.post('/api/login', (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).send("Username/email and password are required.");
  }
  const sql = 'SELECT * FROM ACCOUNT_T WHERE username = ? OR user_email = ?';
  db.query(sql, [usernameOrEmail, usernameOrEmail], (err, results) => {
    if (err) {
      return res.status(500).send("Server error occurred.");
    }
    if (results.length === 0) {
      return res.status(401).send("Invalid credentials");
    }
    const user = results[0];
    bcrypt.compare(password, user.user_password, (compareErr, isMatch) => {
      if (compareErr) {
        console.error("Error comparing passwords:", compareErr);
        return res.status(500).send("Server error occurred during password comparison.");
      }
      if (!isMatch) {
        return res.status(401).send("Invalid credentials");
      }
      const updateSql = 'UPDATE ACCOUNT_T SET latest_login_timestamp = NOW() WHERE user_id = ?';
      db.query(updateSql, [user.user_id], (updateErr) => {
        if (updateErr) {
          console.error('Error updating login timestamp:', updateErr);
          return res.status(500).send("Server error occurred while updating login timestamp.");
        }

	const token = jwt.sign(
  { userId: user.user_id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN });

	res.status(200).json({
  message: "Login successful",
  username: user.username,
  token
	});
      });
    });
  });
});

// =============================
//  GET /getAccountInfo
// =============================
app.get('/api/getAccountInfo', authenticateToken, (req, res) => {
  const { userId } = req.user; 

  const sql = `
    SELECT user_email, username, favorite_location
    FROM ACCOUNT_T
    WHERE user_id = ?
    LIMIT 1
  `;
  db.query(sql, [userId], (err, results) => {
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
//  - Compare the current password with the stored hash
//  - If newPassword is provided, hash before saving
// =============================
app.put('/api/updateAccount', authenticateToken, (req, res) => {

  const userId = req.user.userId;
  const {
    newEmail,
    newUsername,
    newFavoriteLocation,
    currentPassword,
    newPassword
  } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  const selectSql = `
    SELECT user_password, user_email, username, favorite_location
    FROM ACCOUNT_T
    WHERE (user_id = ?)
    LIMIT 1
  `;
  db.query(selectSql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user info:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const user = results[0];
    bcrypt.compare(currentPassword, user.user_password, async (compareErr, isMatch) => {
      if (compareErr) {
        console.error('Error comparing current passwords:', compareErr);
        return res.status(500).json({ message: 'Password comparison failed.' });
      }
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password.' });
      }
      const updateFields = [];
      const params = [];

      if (newEmail && newEmail.trim() !== '' && newEmail !== user.user_email) {
        updateFields.push('user_email = ?');
        params.push(newEmail.trim());
      }
      if (newUsername && newUsername.trim() !== '' && newUsername !== user.username) {
        updateFields.push('username = ?');
        params.push(newUsername.trim());
      }
      if (newFavoriteLocation && newFavoriteLocation.trim() !== '' && newFavoriteLocation.trim() !== user.favorite_location) {
        updateFields.push('favorite_location = ?');
        params.push(newFavoriteLocation.trim());
      }

      // 4) If newPassword is provided, hash it and store
      if (newPassword && newPassword.trim() !== '') {
        const passwordRegex = /^(?=.*\d).{6,}$/;
        if (!passwordRegex.test(newPassword)) {
          return res.status(400).json({
            message: 'Please choose a password with at least 6 characters including at least one number.'
          });
        }
        try {
          const hashedNewPassword = await bcrypt.hash(newPassword.trim(), 10);
          updateFields.push('user_password = ?');
          params.push(hashedNewPassword);
        } catch (hashErr) {
          console.error('Error hashing new password:', hashErr);
          return res.status(500).json({ message: 'Error hashing new password.' });
        }
      }
      if (updateFields.length === 0) {
        return res.status(200).json({ message: 'No changes submitted.' });
      }
      const updateSql = `
        UPDATE ACCOUNT_T
        SET ${updateFields.join(', ')}
        WHERE user_id = ?
      `;
      params.push(userId);

      // 5) Execute the update
      db.query(updateSql, params, (updateErr) => {
        if (updateErr) {
          console.error('Error updating account:', updateErr);
          return res.status(500).json({ message: 'Server error while updating account. failed to update.' });
        }
        return res.status(200).json({ message: 'Account updated successfully!' });
      });
    });
  });
});

// =============================
//  PUT /updateUserLocation
// =============================
app.put('/api/updateUserLocation', authenticateToken, (req, res) => {
  
	const userId = req.user.userId;
	const { newLocation } = req.body;

  if (!newLocation || newLocation.trim() === '') {
    return res.status(400).json({ message: 'New Location are required.' });
  }
  const sql = `
    UPDATE ACCOUNT_T
    SET user_location = ?
    WHERE user_id = ?
  `;

  db.query(sql, [newLocation.trim(), userId], (err, result) => {
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

// *********************
// STATIC FILES & CATCH-ALL ROUTE
// *********************

// Serve static Angular files from the public directory.
app.use(express.static(path.join(__dirname, 'public')));

// For any routes not handled by API or static files, serve index.html (Angular entry point).
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// *********************
// START SERVER
// *********************
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
