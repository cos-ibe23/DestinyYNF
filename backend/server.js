require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const app = express();

const pool = require("./db");
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("DestinyYNF API Running");
});
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("DB connected at:", res.rows[0]);
  }
});
// SIGNUP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO customers (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    res.json(newUser.rows[0]);

  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});


// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM customers WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash   // ✅ THIS IS THE FIX
    );

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    res.json({
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// CREATE ORDER
app.post("/orders", async (req, res) => {
  const { customer_id, origin, destination, weight } = req.body;

  try {
    const newOrder = await pool.query(
      "INSERT INTO orders (customer_id, origin, destination, weight) VALUES ($1,$2,$3,$4) RETURNING *",
      [customer_id, origin, destination, weight]
    );

    res.json(newOrder.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// GET ORDERS FOR A USER
app.get("/orders/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const orders = await pool.query(
      "SELECT * FROM orders WHERE customer_id=$1",
      [id]
    );

    res.json(orders.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch orders" });
  }
});


// LOAD ORDERS
async function loadOrders() {
  const res = await fetch(`${BASE_URL}/orders/${user.id}`);
  const orders = await res.json();

  const container = document.getElementById("ordersList");
  container.innerHTML = "";

  orders.forEach(order => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>From:</strong> ${order.origin}</p>
      <p><strong>To:</strong> ${order.destination}</p>
      <p><strong>Weight:</strong> ${order.weight} kg</p>
      <hr>
    `;
    container.appendChild(div);
  });
}
