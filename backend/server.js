const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// =========================
// Middleware
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// MongoDB
// =========================
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

// =========================
// API Routes
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// =========================
// Health Check
// =========================
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

// =========================
// Serve Frontend
// =========================
const frontendPath = path.join(__dirname, "../frontend");

app.use(express.static(frontendPath));

// =========================
// Frontend Pages
// =========================

// Trang chủ
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "login.html"));
});

// Trang đăng nhập
app.get("/login.html", (req, res) => {
    res.sendFile(path.join(frontendPath, "login.html"));
});

// Trang đăng ký
app.get("/register.html", (req, res) => {
    res.sendFile(path.join(frontendPath, "register.html"));
});

// Trang quản lý chi tiêu
app.get("/index.html", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// =========================
// 404
// =========================
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});