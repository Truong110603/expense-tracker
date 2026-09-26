const express = require("express");
const Expense = require("../models/Expense");

const router = express.Router();

// GET - lấy danh sách giao dịch
router.get("/", async (req, res) => {
    try {
        const expenses = await Expense
            .find()
            .sort({ date: -1 });

        res.json(expenses);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// POST - thêm giao dịch
router.post("/", async (req, res) => {
    try {
        const expense = new Expense({
            title: req.body.title,
            amount: req.body.amount,
            type: req.body.type,
            category: req.body.category,
            date: req.body.date
        });

        const savedExpense = await expense.save();

        res.status(201).json(savedExpense);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// DELETE - xóa giao dịch
router.delete("/:id", async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);

        res.json({
            message: "Deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;