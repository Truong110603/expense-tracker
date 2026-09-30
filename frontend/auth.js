const API_AUTH = "/api/auth";


// ========================================
// REGISTER
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("message");


        if (password !== confirmPassword) {

            message.textContent =
                "Mật khẩu nhập lại không khớp";

            return;
        }


        try {

            const response = await fetch(
                `${API_AUTH}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message || "Đăng ký thất bại";

                return;
            }


            message.textContent =
                "Đăng ký thành công! Đang chuyển đến trang đăng nhập...";


            setTimeout(() => {

                window.location.href = "login.html";

            }, 1500);


        } catch (error) {

            console.error(error);

            message.textContent =
                "Không thể kết nối đến server";
        }

    });

}


// ========================================
// LOGIN
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("message");


        try {

            const response = await fetch(
                `${API_AUTH}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message || "Đăng nhập thất bại";

                return;
            }


            // Lưu JWT
            localStorage.setItem(
                "token",
                data.token
            );


            // Lưu thông tin user
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            window.location.href = "index.html";


        } catch (error) {

            console.error(error);

            message.textContent =
                "Không thể kết nối đến server";
        }

    });

}