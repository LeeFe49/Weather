const signupForm = document.getElementById("signupForm");
const authMessage = document.getElementById("authMessage");
const btnSignup = document.getElementById("btnSignup");
const signupAreaSearchInput = document.getElementById("signupAreaSearch");
const signupAreaResults = document.getElementById("signupAreaResults");
const signupAreaSelected = document.getElementById("signupAreaSelected");
const btnSignupAreaSearch = document.getElementById("btnSignupAreaSearch");

let selectedArea = null;

function showMessage(text, isError = true) {
    authMessage.textContent = text;
    authMessage.classList.remove("hidden", "success", "error");
    authMessage.classList.add(isError ? "error" : "success");
}

function hideMessage() {
    authMessage.classList.add("hidden");
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatCoords(lat, lon) {
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
}

function getSelectedRoles() {
    const role = signupForm.querySelector('input[name="role"]:checked')?.value;
    if (role === "WRITE") {
        return ["ROLE_READ", "ROLE_WRITE"];
    }
    return ["ROLE_READ"];
}

async function searchAreas(name) {
    const params = new URLSearchParams({ name });
    const response = await fetch(`/read/areas/like?${params}`);
    if (!response.ok) {
        throw new Error("지역 검색에 실패했습니다.");
    }
    return response.json();
}

function resetAreaSearch() {
    signupAreaResults.classList.add("hidden");
    signupAreaResults.innerHTML = "";
}

function renderSelectedArea() {
    if (!selectedArea) {
        signupAreaSelected.classList.add("hidden");
        signupAreaSelected.innerHTML = "";
        return;
    }

    signupAreaSelected.classList.remove("hidden");
    signupAreaSelected.innerHTML = `
        <div class="diary-area-selected-info">
            <strong>${escapeHtml(selectedArea.name)}</strong>
            ${selectedArea.text ? `<span class="diary-area-selected-memo">${escapeHtml(selectedArea.text)}</span>` : ""}
            <span class="diary-area-selected-coords">${formatCoords(selectedArea.lat, selectedArea.lon)}</span>
        </div>
        <button type="button" class="btn-clear-area" id="btnClearSignupArea">해제</button>
    `;

    document.getElementById("btnClearSignupArea").addEventListener("click", () => {
        selectedArea = null;
        renderSelectedArea();
        resetAreaSearch();
    });
}

function renderAreaResults(areas) {
    signupAreaResults.innerHTML = "";

    if (areas.length === 0) {
        signupAreaResults.innerHTML = `<li class="area-search-empty">검색 결과가 없습니다.</li>`;
        signupAreaResults.classList.remove("hidden");
        return;
    }

    areas.forEach((area) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "area-search-result";
        button.innerHTML = `
            <strong>${escapeHtml(area.name)}</strong>
            <span>${formatCoords(area.lat, area.lon)}${area.text ? ` · ${escapeHtml(area.text)}` : ""}</span>
        `;
        button.addEventListener("click", () => {
            selectedArea = area;
            renderSelectedArea();
            signupAreaSearchInput.value = "";
            resetAreaSearch();
        });
        item.appendChild(button);
        signupAreaResults.appendChild(item);
    });

    signupAreaResults.classList.remove("hidden");
}

async function performAreaSearch() {
    const query = signupAreaSearchInput.value.trim();
    if (!query) {
        resetAreaSearch();
        return;
    }

    try {
        btnSignupAreaSearch.disabled = true;
        const areas = await searchAreas(query);
        renderAreaResults(areas);
    } catch (error) {
        showMessage(error.message);
    } finally {
        btnSignupAreaSearch.disabled = false;
    }
}

async function signup(username, password, roles, areaId) {
    const body = { username, password, roles };
    if (areaId) {
        body.areaId = areaId;
    }

    const response = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "회원가입에 실패했습니다.");
    }

    return response.json();
}

btnSignupAreaSearch.addEventListener("click", performAreaSearch);

signupAreaSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        performAreaSearch();
    }
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".area-search-box")) {
        resetAreaSearch();
    }
});

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
        await signup(username, password, getSelectedRoles(), selectedArea?.id ?? null);
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
