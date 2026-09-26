const API_URL =
    "http://localhost:3000/api/expenses";

const form =
    document.getElementById("expenseForm");

const expenseList =
    document.getElementById("expenseList");


// =============================
// Lấy dữ liệu
// =============================

async function loadExpenses() {

    const response =
        await fetch(API_URL);

    const expenses =
        await response.json();

    displayExpenses(expenses);

    calculateSummary(expenses);
}


// =============================
// Hiển thị danh sách
// =============================

function displayExpenses(expenses) {

    expenseList.innerHTML = "";

    expenses.forEach(expense => {

        const div =
            document.createElement("div");

        div.className =
            "transaction";

        const sign =
            expense.type === "income"
                ? "+"
                : "-";

        div.innerHTML = `
            <div>
                <strong>
                    ${expense.title}
                </strong>

                <br>

                ${expense.category}
                -
                ${new Date(
                    expense.date
                ).toLocaleDateString("vi-VN")}
            </div>

            <div>

                <strong class="${
                    expense.type
                }">

                    ${sign}
                    ${formatMoney(
                        expense.amount
                    )}

                </strong>

                <button
                    class="delete-btn"
                    onclick="deleteExpense('${expense._id}')"
                >
                    Xóa
                </button>

            </div>
        `;

        expenseList.appendChild(div);
    });
}


// =============================
// Thêm giao dịch
// =============================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const data = {

            title:
                document.getElementById(
                    "title"
                ).value,

            amount:
                Number(
                    document.getElementById(
                        "amount"
                    ).value
                ),

            type:
                document.getElementById(
                    "type"
                ).value,

            category:
                document.getElementById(
                    "category"
                ).value,

            date:
                document.getElementById(
                    "date"
                ).value
        };


        await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(data)
        });


        form.reset();

        loadExpenses();
    }
);


// =============================
// Xóa
// =============================

async function deleteExpense(id) {

    await fetch(
        `${API_URL}/${id}`,
        {
            method: "DELETE"
        }
    );

    loadExpenses();
}


// =============================
// Tính tổng
// =============================

function calculateSummary(expenses) {

    let income = 0;
    let expense = 0;

    expenses.forEach(item => {

        if (item.type === "income") {

            income += item.amount;

        } else {

            expense += item.amount;

        }
    });

    const balance =
        income - expense;


    document.getElementById(
        "totalIncome"
    ).textContent =
        formatMoney(income) + " VNĐ";


    document.getElementById(
        "totalExpense"
    ).textContent =
        formatMoney(expense) + " VNĐ";


    document.getElementById(
        "balance"
    ).textContent =
        formatMoney(balance) + " VNĐ";
}


// =============================
// Format tiền
// =============================

function formatMoney(amount) {

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(amount);
}


// =============================
// Chạy khi mở trang
// =============================

loadExpenses();