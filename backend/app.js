const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// test server
app.get("/", (req, res) => {
  res.send("Backend koperasi ARIMA jalan");
});

// routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/dashboard", dashboardRoutes);

const productRoutes = require("./routes/productRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

app.use("/products", productRoutes);
app.use("/transactions", transactionRoutes);

const predictRoutes = require("./routes/predictRoutes");
app.use("/predict", predictRoutes);

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
