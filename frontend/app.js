const API_URL = "/api/expenses";

const token = localStorage.getItem("token");

// ========================================
// KIỂM TRA ĐĂNG NHẬP
// ========================================

if (!token) {
    window.location.href = "/login.html";
}


// ========================================
// LẤY ELEMENT
// ========================================

const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");


// ========================================
// THÔNG TIN USER
// ========================================

const user = JSON.parse(
    localStorage.getItem("user") || "{}"
);

const userName = document.getElementById("userName");
const avatarLetter = document.getElementById("avatarLetter");

if (userName) {
    userName.textContent = user.name || "User";
}

if (avatarLetter) {
    avatarLetter.textContent =
        (user.name || "U").charAt(0).toUpperCase();
}


// ========================================
// FORMAT TIỀN
// ========================================

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}


// ========================================
// FORMAT NGÀY
// ========================================

function formatDate(date) {
    return new Date(date).toLocaleDateString("vi-VN");
}


// ========================================
// CATEGORY
// ========================================

const categoryNames = {
    food: "Ăn uống",
    transport: "Đi lại",
    shopping: "Mua sắm",
    education: "Học tập",
    salary: "Lương",
    other: "Khác"
};


// ========================================
// CATEGORY ICON
// ========================================

const categoryIcons = {
    food: "🍔",
    transport: "🚗",
    shopping: "🛍️",
    education: "📚",
    salary: "💰",
    other: "📦"
};


// ========================================
// LẤY DANH SÁCH GIAO DỊCH
// ========================================

async function loadExpenses() {

    try {

        const response = await fetch(API_URL, {
            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }
        });


        if (!response.ok) {

            throw new Error(
                "Không thể lấy danh sách giao dịch"
            );

        }


        const expenses = await response.json();

        displayExpenses(expenses);


    } catch (error) {

        console.error(
            "Load expenses error:",
            error
        );

    }
}


// ========================================
// HIỂN THỊ GIAO DỊCH
// ========================================

function displayExpenses(expenses) {

    if (!expenseList) {
        return;
    }


    if (expenses.length === 0) {

        expenseList.innerHTML = `
            <div class="empty-state">
                <div style="font-size:35px;">
                    💸
                </div>

                <p>
                    Chưa có giao dịch nào
                </p>

                <small>
                    Hãy thêm giao dịch đầu tiên của bạn
                </small>
            </div>
        `;

        return;
    }


    expenseList.innerHTML = expenses.map(expense => {

        const isIncome =
            expense.type === "income";


        const amountClass =
            isIncome
                ? "income"
                : "expense";


        const amountPrefix =
            isIncome
                ? "+"
                : "-";


        const category =
            categoryNames[expense.category]
            || expense.category;


        const icon =
            categoryIcons[expense.category]
            || "💳";


        return `
            <div class="transaction">

                <div class="transaction-icon">
                    ${icon}
                </div>


                <div class="transaction-info">

                    <strong>
                        ${escapeHtml(expense.title)}
                    </strong>

                    <small>
                        ${category}
                        •
                        ${formatDate(expense.date)}
                    </small>

                </div>


                <div class="transaction-amount">

                    <strong class="${amountClass}">
                        ${amountPrefix}
                        ${formatMoney(expense.amount)}
                    </strong>

                    <small>
                        ${isIncome
                            ? "Income"
                            : "Expense"}
                    </small>

                </div>


                <button
                    class="delete-btn"
                    onclick="deleteExpense('${expense._id}')"
                    title="Xóa giao dịch"
                >
                    ✕
                </button>

            </div>
        `;

    }).join("");
}


// ========================================
// SUMMARY
// ========================================

async function loadSummary() {

    try {

        const response = await fetch(
            "/api/expenses/summary",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                "Không thể lấy thống kê"
            );

        }


        const data = await response.json();


        const totalIncome =
            document.getElementById("totalIncome");

        const totalExpense =
            document.getElementById("totalExpense");

        const balance =
            document.getElementById("balance");


        if (totalIncome) {

            totalIncome.textContent =
                formatMoney(data.totalIncome);

        }


        if (totalExpense) {

            totalExpense.textContent =
                formatMoney(data.totalExpense);

        }


        if (balance) {

            balance.textContent =
                formatMoney(data.balance);

        }


    } catch (error) {

        console.error(
            "Summary error:",
            error
        );

    }
}


// ========================================
// THÊM GIAO DỊCH
// ========================================

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const title =
                document.getElementById("title")
                    .value
                    .trim();


            const amount =
                Number(
                    document.getElementById("amount")
                        .value
                );


            const type =
                document.getElementById("type")
                    .value;


            const category =
                document.getElementById("category")
                    .value;


            const date =
                document.getElementById("date")
                    .value;


            if (!title) {

                alert(
                    "Vui lòng nhập tên giao dịch"
                );

                return;
            }


            if (!amount || amount <= 0) {

                alert(
                    "Vui lòng nhập số tiền hợp lệ"
                );

                return;
            }


            if (!date) {

                alert(
                    "Vui lòng chọn ngày"
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                title,
                                amount,
                                type,
                                category,
                                date
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Không thể thêm giao dịch"
                    );

                }


                console.log(
                    "Add transaction:",
                    data
                );


                // Reset form
                form.reset();


                // Đặt lại ngày
                setToday();


                // Cập nhật dữ liệu
                await loadExpenses();

                await loadSummary();

                await loadCategoryChart();


            } catch (error) {

                console.error(
                    "Add transaction error:",
                    error
                );

                alert(
                    "Lỗi: " + error.message
                );

            }

        }
    );

}


// ========================================
// XÓA GIAO DỊCH
// ========================================

async function deleteExpense(id) {

    const confirmed =
        confirm(
            "Bạn có chắc muốn xóa giao dịch này?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Không thể xóa giao dịch"
            );

        }


        await loadExpenses();

        await loadSummary();

        await loadCategoryChart();


    } catch (error) {

        console.error(
            "Delete expense error:",
            error
        );

        alert(
            "Lỗi: " + error.message
        );

    }
}


// ========================================
// BIỂU ĐỒ
// ========================================

let categoryChart = null;


async function loadCategoryChart() {

    try {

        const response =
            await fetch(
                "/api/expenses/summary/category",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Không thể lấy dữ liệu biểu đồ"
            );

        }


        const data =
            await response.json();


        const canvas =
            document.getElementById(
                "categoryChart"
            );


        if (!canvas) {
            return;
        }


        const labels =
            data.map(
                item => item.category
            );


        const values =
            data.map(
                item => item.total
            );


        const displayLabels =
            labels.map(
                category =>
                    categoryNames[category]
                    || category
            );


        const ctx =
            canvas.getContext("2d");


        // Xóa chart cũ
        if (categoryChart) {

            categoryChart.destroy();

        }


        categoryChart =
            new Chart(
                ctx,
                {
                    type: "doughnut",

                    data: {

                        labels:
                            displayLabels,

                        datasets: [
                            {
                                label:
                                    "Chi tiêu",

                                data:
                                    values,

                                borderWidth:
                                    0,

                                hoverOffset:
                                    8
                            }
                        ]
                    },


                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        cutout:
                            "68%",


                        plugins: {

                            legend: {

                                position:
                                    "bottom",

                                labels: {

                                    color:
                                        "#858a9c",

                                    padding:
                                        18,

                                    usePointStyle:
                                        true,

                                    font: {
                                        size:
                                            11
                                    }
                                }
                            },


                            tooltip: {

                                callbacks: {

                                    label:
                                        function (
                                            context
                                        ) {

                                            return (
                                                context.label
                                                + ": "
                                                + formatMoney(
                                                    context.raw
                                                )
                                            );

                                        }
                                }
                            }
                        }
                    }
                }
            );


    } catch (error) {

        console.error(
            "Category chart error:",
            error
        );

    }
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;
}


// ========================================
// LOGOUT
// ========================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "/login.html";

        }
    );

}


// ========================================
// SET NGÀY HIỆN TẠI
// ========================================

function setToday() {

    const dateInput =
        document.getElementById(
            "date"
        );


    if (!dateInput) {
        return;
    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    dateInput.value =
        `${year}-${month}-${day}`;
}


// ========================================
// KHỞI ĐỘNG
// ========================================

setToday();

loadExpenses();

loadSummary();

loadCategoryChart();

