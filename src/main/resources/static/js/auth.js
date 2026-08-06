const TOKEN_KEY = "weather.authToken";

function getToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return null;
    }
    return token.replace(/^"|"$/g, "");
}

function isLoggedIn() {
    return !!getToken();
}

function getUsernameFromToken() {
    const token = getToken();
    if (!token) {
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub || null;
    } catch {
        return null;
    }
}

function buildAuthHeaders(includeJson = false) {
    const headers = {};
    if (includeJson) {
        headers["Content-Type"] = "application/json";
    }

    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/signin.html";
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = "/signin.html";
        return false;
    }
    return true;
}

async function authFetch(url, options = {}) {
    const hasBody = options.body !== undefined && options.body !== null;
    const response = await fetch(url, {
        ...options,
        headers: {
            ...buildAuthHeaders(hasBody),
            ...options.headers,
        },
    });

    if (response.status === 401) {
        logout();
        throw new Error("로그인이 필요합니다.");
    }

    return response;
}
