loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        console.log("Login response:", data);

        if (!response.ok) {
            message.textContent = data.message || "Đăng nhập thất bại";
            return;
        }

        // Lưu JWT
        localStorage.setItem("token", data.token);

        // Lưu thông tin user
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        console.log("Đăng nhập thành công");
        console.log("Token:", localStorage.getItem("token"));

        // Chuyển sang trang chính
        window.location.href = "/index.html";

    } catch (error) {
        console.error("Login error:", error);
        message.textContent = "Không thể kết nối server";
    }
});