require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

});

// test route
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Connected to Naren !",
      time: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// get users
app.get("/user", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
