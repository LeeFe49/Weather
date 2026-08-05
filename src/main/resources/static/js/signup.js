const signupForm = document.getElementById("signupForm");
const authMessage = document.getElementById("authMessage");
const btnSignup = document.getElementById("btnSignup");

const DEFAULT_ROLES = ["ROLE_READ", "ROLE_WRITE"];

function showMessage(text, isError = true) {
    authMessage.textContent = text;
    authMessage.classList.remove("hidden", "success", "error");
    authMessage.classList.add(isError ? "error" : "success");
}

function hideMessage() {
    authMessage.classList.add("hidden");
}

async function signup(username, password) {
    const response = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            password,
            roles: DEFAULT_ROLES,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "회원가입에 실패했습니다.");
    }

    return response.json();
}

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideMessage();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;

    if (!username || !password) {
        showMessage("아이디와 비밀번호를 입력해 주세요.");
        return;
    }

    if (password !== passwordConfirm) {
        showMessage("비밀번호가 일치하지 않습니다.");
        return;
    }

    btnSignup.disabled = true;
    btnSignup.textContent = "가입 중…";

    try {
        await signup(username, password);
        showMessage("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.", false);
        setTimeout(() => {
            window.location.href = "/signin.html";
        }, 1200);
    } catch (error) {
        showMessage(error.message.replace(/^"|"$/g, ""));
    } finally {
        btnSignup.disabled = false;
        btnSignup.textContent = "가입하기";
    }
});
