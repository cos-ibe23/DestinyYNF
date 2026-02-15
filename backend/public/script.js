const BASE_URL = window.location.origin;

// LOGOUT
function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

    // DASHBOARD LOGIC
const user = JSON.parse(localStorage.getItem("user"));

if (window.location.pathname.includes("dashboard")) {
  if (!user) {
    window.location.href = "login.html";
  } else {
//    loadOrders();
  }
}

// CREATE ORDER
const orderForm = document.getElementById("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // 🚨 THIS IS CRITICAL

  const origin = document.getElementById("origin").value;
  const destination = document.getElementById("destination").value;
  const weight = document.getElementById("weight").value;

  const customer_id = localStorage.getItem("userId"); // or however you're storing it

  const res = await fetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_id,
      origin,
      destination,
      weight
    })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Order created!");
  } else {
    alert(data.error || "Order failed");
  }
});

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "dashboard.html";
    } else {
      alert(data.error);
    }
  });
}


// SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
      window.location.href = "login.html";
    } else {
      alert(data.error || "Signup failed");
    }
  });
}
