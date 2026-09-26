const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });

// API
app.get("/", (req, res) => {
    res.json({
        message: "Expense Tracker API is running"
    });
});

app.use("/api/expenses", expenseRoutes);

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});