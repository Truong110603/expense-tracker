const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/*
    REGISTER
    POST /api/auth/register
*/
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Kiểm tra dữ liệu
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        // Kiểm tra password
        if (password.length < 6) {
            return res.status(400).json({
                message: "Mật khẩu phải có ít nhất 6 ký tự"
            });
        }

        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email đã được đăng ký"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Đăng ký thành công"
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
});


/*
    LOGIN
    POST /api/auth/login
*/
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra dữ liệu
        if (!email || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập email và mật khẩu"
            });
        }

        // Tìm user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Email hoặc mật khẩu không chính xác"
            });
        }

        // Kiểm tra password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Email hoặc mật khẩu không chính xác"
            });
        }

        // Tạo JWT
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
});


module.exports = router;