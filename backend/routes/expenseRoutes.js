const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// GET ALL EXPENSES
// ========================================
router.get("/", authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({
            userId: req.user.userId
        }).sort({
            date: -1
        });

        res.json(expenses);

    } catch (error) {
        console.error("Get expenses error:", error);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
});


// ========================================
// EXPENSE SUMMARY
// ========================================
router.get("/summary", authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({
            userId: req.user.userId
        });

        let totalIncome = 0;
        let totalExpense = 0;

        expenses.forEach((expense) => {
            if (expense.type === "income") {
                totalIncome += expense.amount;
            } else if (expense.type === "expense") {
                totalExpense += expense.amount;
            }
        });

        const balance = totalIncome - totalExpense;

        res.json({
            totalIncome,
            totalExpense,
            balance,
            totalTransactions: expenses.length
        });

    } catch (error) {
        console.error("Summary error:", error);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
});
// ========================================
// EXPENSE SUMMARY BY CATEGORY
// ========================================
router.get("/summary/category", authMiddleware, async (req, res) => {
    try {
        const result = await Expense.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.userId),
                    type: "expense"
                }
            },
            {
                $group: {
                    _id: "$category",
                    total: {
                        $sum: "$amount"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    total: 1
                }
            },
            {
                $sort: {
                    total: -1
                }
            }
        ]);

        res.json(result);

    } catch (error) {
        console.error("Category summary error:", error);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
});


// ========================================
// GET ONE EXPENSE
// ========================================
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!expense) {
            return res.status(404).json({
                message: "Không tìm thấy giao dịch"
            });
        }

        res.json(expense);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
});



// ========================================
// CREATE EXPENSE
// ========================================
router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            title,
            amount,
            type,
            category,
            date
        } = req.body;

        if (
            !title ||
            amount === undefined ||
            !type ||
            !category ||
            !date
        ) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        const expense = new Expense({
            userId: req.user.userId,
            title,
            amount,
            type,
            category,
            date
        });

        await expense.save();

        res.status(201).json(expense);

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: "Không thể tạo giao dịch"
        });
    }
});




// ========================================
// UPDATE EXPENSE
// ========================================
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const {
            title,
            amount,
            type,
            category,
            date
        } = req.body;

        const expense = await Expense.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.userId
            },
            {
                title,
                amount,
                type,
                category,
                date
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!expense) {
            return res.status(404).json({
                message: "Không tìm thấy giao dịch"
            });
        }

        res.json(expense);

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: "Không thể cập nhật giao dịch"
        });
    }
});


// ========================================
// DELETE EXPENSE
// ========================================
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!expense) {
            return res.status(404).json({
                message: "Không tìm thấy giao dịch"
            });
        }

        res.json({
            message: "Deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
});


module.exports = router;