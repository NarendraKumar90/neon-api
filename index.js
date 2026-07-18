require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// middleware functionality
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

//get reg and tran

app.get('/reg',async (req,res)=>{
    var result=await pool.query('select * from reg')
    res.json({ users: result.rows});
})

app.get('/reg/:id', async (req,res) => {
   
   try {
    const { id } = req.params;
     var result=await pool.query('select * from reg where uid=$1',[id])
   res.json({ user: result.rows[0]});
   } catch (error) {
    return res.status(400).json({ error: 'Invalid user ID' });
   }
  
})

//get by Mobile 

app.get('/regByMob/:mob', async (req,res) => {
   
   try {
    const { mob } = req.params;
     var result=await pool.query('select * from reg where mob=$1',[mob])
  // res.json({ user: result.rows[0]});
     res.status(200).json({
      status: 200,
      user: result.rows[0]
    });
   } catch (error) {
    return res.status(400).json({ error: 'Invalid user ID' });
   }
  
})

//Get current balance

app.get('/currentbalance/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const result = await pool.query(
      `SELECT current_bal
       FROM tran
       WHERE uid = $1
       ORDER BY tid DESC
       LIMIT 1`,
      [uid]
    );

    res.status(200).json({
      status: 200,
      current_bal: result.rows.length ? result.rows[0].current_bal : 0
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//Get Total debit

app.get('/totaldebit', async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT COALESCE(SUM(debit), 0) AS total_debit
       FROM tran`
    );

    res.status(200).json({
      status: 200,
      total_debit: result.rows[0].total_debit
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//Get Total Credit

app.get('/totalcredit', async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT COALESCE(SUM(credit), 0) AS total_credit
       FROM tran`
    );

    res.status(200).json({
      status: 200,
      total_credit: result.rows[0].total_credit
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


app.get('/tran/:tid', async (req,res) => {
   
   try {
 const { tid } = req.params;
     var result=await pool.query('select * from tran where tid=$1',[tid])
   res.json({ transaction: result.rows[0]});
   } catch (error) {
    return res.status(400).json({ error: 'Invalid transaction ID' });
   }
  
})


app.get("/tran", async (req, res) => {
  try {
    const result = await pool.query("select * from tran order by tid desc");
    res.json({ tran: result.rows });
    console.log(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//post Api

app.post("/save", async (req, res) => {
  const { name, mob, opbal } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO reg(name, mob, opbal) VALUES ($1, $2, $3) RETURNING  *",
      [name, mob, opbal]
    );

    res.status(201).json({
        status: 201,
      message: "Data inserted successfully",
      data: result.rows
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

app.post("/tsave", async (req, res) => {
  try {
    const { uid,debit, credit, tdate, note,current_bal } = req.body;

    await pool.query(
      "INSERT INTO tran (uid,debit, credit, tdate, note,current_bal) VALUES ($1, $2, $3, $4, $5,$6)",
      [uid,debit, credit, tdate, note,current_bal]
    );

    res.status(201).json({
      message: "Transaction saved successfully"
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error: "Server error"
    });
  }
});

//Put Api

app.put("/update", async (req, res) => {
  //const { id } = req.params;
  const { name, mob, opbal } = req.body;

  await pool.query(
    "UPDATE reg SET name=$1, mob=$2, opbal=$3 WHERE id=$4",
    [name, mob, opbal, id]
  );

  res.send("Updated");
});

app.put("/tupdt", async (req, res) => {
  //const { id } = req.params;
  const { debit, credit,tdate,note, current_bal,tid } = req.body;

  await pool.query(
    "UPDATE tran SET debit=$1, credit=$2, tdate=$3, note=$4 ,current_bal=$5  WHERE tid=$6",
    [debit, credit, tdate,note,current_bal, tid]
  );

  res.send("Updated");
});

//Delete Api
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query(
    "DELETE FROM reg WHERE id=$1",
    [id]
  );

  res.send("Deleted");
});


app.delete("/tdelete/:tid", async (req, res) => {
  try {
    const { tid } = req.params;

    await pool.query(
      "DELETE FROM tran WHERE tid = $1",
      [tid]
    );

    res.json({
      message: "Transaction deleted successfully"
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error: "Server error"
    });
  }
});





// server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
