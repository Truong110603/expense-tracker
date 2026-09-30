const { MongoClient, ObjectId } = require("mongodb");

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    cachedClient = client;

    console.log("Connected to MongoDB Atlas");

    return client;
}

exports.handler = async () => {
    try {
        console.log("Starting expense statistics...");

        const client = await connectToDatabase();
        const db = client.db("expense_tracker");
        const expensesCollection = db.collection("expenses");
        const statisticsCollection = db.collection("statistics");

        const expenses = await expensesCollection.find({}).toArray();

        // Thống kê riêng cho từng người dùng.
        const userStatistics = new Map();

        for (const expense of expenses) {
            if (!expense.userId) continue;

            const userId = expense.userId.toString();

            if (!userStatistics.has(userId)) {
                userStatistics.set(userId, {
                    totalIncome: 0,
                    totalExpense: 0,
                    totalTransactions: 0,
                    categories: {}
                });
            }

            const statistics = userStatistics.get(userId);
            const amount = Number(expense.amount) || 0;

            statistics.totalTransactions += 1;

            if (expense.type === "income") {
                statistics.totalIncome += amount;
            }

            if (expense.type === "expense") {
                statistics.totalExpense += amount;

                const category = expense.category || "other";
                statistics.categories[category] =
                    (statistics.categories[category] || 0) + amount;
            }
        }

        // Lưu/cập nhật một bản thống kê mới nhất cho từng user.
        for (const [userId, statistics] of userStatistics) {
            const document = {
                userId: new ObjectId(userId),
                generatedAt: new Date(),
                totalIncome: statistics.totalIncome,
                totalExpense: statistics.totalExpense,
                balance: statistics.totalIncome - statistics.totalExpense,
                totalTransactions: statistics.totalTransactions,
                categories: statistics.categories
            };

            await statisticsCollection.updateOne(
                { userId: document.userId },
                { $set: document },
                { upsert: true }
            );
        }

        console.log(`Statistics generated for ${userStatistics.size} user(s)`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Thống kê chi tiêu thành công",
                usersProcessed: userStatistics.size
            })
        };

    } catch (error) {
        console.error("Lambda error:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Không thể thống kê chi tiêu",
                error: error.message
            })
        };
    }
};
