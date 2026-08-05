const signinForm = document.getElementById("signinForm");
const authMessage = document.getElementById("authMessage");
const btnSignin = document.getElementById("btnSignin");

const TOKEN_KEY = "weather.authToken";

function showMessage(text, isError = true) {
    authMessage.textContent = text;
    authMessage.classList.remove("hidden", "success", "error");
    authMessage.classList.add(isError ? "error" : "success");
}

function hideMessage() {
    authMessage.classList.add("hidden");
}

async function signin(username, password) {
    const response = await fetch("/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "로그인에 실패했습니다.");
    }

    return response.text();
}

signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideMessage();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        showMessage("아이디와 비밀번호를 입력해 주세요.");
        return;
    }

    btnSignin.disabled = true;
    btnSignin.textContent = "로그인 중…";

    try {
        const token = await signin(username, password);
        localStorage.setItem(TOKEN_KEY, token);
        showMessage("로그인되었습니다. 메인으로 이동합니다.", false);
        setTimeout(() => {
            window.location.href = "/";
        }, 800);
    } catch (error) {
        showMessage(error.message.replace(/^"|"$/g, ""));
    } finally {
        btnSignin.disabled = false;
        btnSignin.textContent = "로그인";
    }
});
