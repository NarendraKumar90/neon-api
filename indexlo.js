require("dotenv").config();

console.log("DATABASE_URL =", process.env.DATABASE_URL);

const express = require("express");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/", async (req, res) => {
    console.log(process.env.DATABASE_URL);
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Connected to Neon!",
      time: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
//get api

app.get("/user", async (req, res) => {
  try {
    const result = await pool.query("select * from users ");
    res.json({ users: result.rows });
    console.log(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});