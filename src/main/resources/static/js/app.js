const diaryList = document.getElementById("diaryList");
const emptyState = document.getElementById("emptyState");
const loading = document.getElementById("loading");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const diaryModal = document.getElementById("diaryModal");
const diaryForm = document.getElementById("diaryForm");
const modalTitle = document.getElementById("modalTitle");
const diaryDateInput = document.getElementById("diaryDate");
const diaryTextInput = document.getElementById("diaryText");
const formNote = document.getElementById("formNote");
const btnDelete = document.getElementById("btnDelete");
const calTitle = document.getElementById("calTitle");
const calendarGrid = document.getElementById("calendarGrid");
const btnCalPrev = document.getElementById("btnCalPrev");
const btnCalNext = document.getElementById("btnCalNext");
const diaryAreaSearchInput = document.getElementById("diaryAreaSearch");
const diaryAreaResults = document.getElementById("diaryAreaResults");
const diaryAreaSelected = document.getElementById("diaryAreaSelected");
const btnDiaryAreaSearch = document.getElementById("btnDiaryAreaSearch");
const headerSubtitle = document.getElementById("headerSubtitle");

const headerUser = document.getElementById("headerUser");
const btnProfile = document.getElementById("btnProfile");
const btnLogin = document.getElementById("btnLogin");
const btnSignup = document.getElementById("btnSignup");
const btnLogout = document.getElementById("btnLogout");

const profileModal = document.getElementById("profileModal");
const profileForm = document.getElementById("profileForm");
const profileUsername = document.getElementById("profileUsername");
const profileRoles = document.getElementById("profileRoles");
const profileAreaSearchInput = document.getElementById("profileAreaSearch");
const profileAreaResults = document.getElementById("profileAreaResults");
const profileAreaSelected = document.getElementById("profileAreaSelected");
const btnProfileAreaSearch = document.getElementById("btnProfileAreaSearch");

const SELECTED_AREA_KEY = "weather.selectedArea";

let editingDate = null;
let calendarView = { year: 0, month: 0 };
let diaryDatesInMonth = new Set();
let areaByIdCache = new Map();
let profilePendingArea = null;
let currentMember = null;

function getTodayString() {
    return formatDate(new Date());
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr) {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
    });
}

function kelvinToCelsius(kelvin) {
    return (kelvin - 273.15).toFixed(1);
}

function formatCoords(lat, lon) {
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
}

function formatRolesDisplay(roles) {
    if (!roles || roles.length === 0) {
        return "없음";
    }
    if (roles.includes("ROLE_WRITE")) {
        return "조회 + 작성";
    }
    if (roles.includes("ROLE_READ")) {
        return "조회";
    }
    return roles.join(", ");
}

function getSelectedArea() {
    const raw = localStorage.getItem(SELECTED_AREA_KEY);
    return raw ? JSON.parse(raw) : null;
}

function saveSelectedAreaLocally(area) {
    if (area) {
        localStorage.setItem(
            SELECTED_AREA_KEY,
            JSON.stringify({
                id: area.id,
                name: area.name,
                lat: area.lat,
                lon: area.lon,
                text: area.text || "",
            }),
        );
    } else {
        localStorage.removeItem(SELECTED_AREA_KEY);
    }
    renderDiarySelectedArea();
    updateFormNote();
    updateHeaderSubtitle();
}

async function saveMemberArea(areaId) {
    const response = await authFetch("/auth/update", {
        method: "POST",
        body: JSON.stringify({ areaId }),
    });

    if (!response.ok) {
        throw new Error("지역을 저장하지 못했습니다.");
    }

    return response.json();
}

async function loadMemberArea() {
    const response = await authFetch("/auth/me");
    if (!response.ok) {
        return;
    }

    currentMember = await response.json();
    if (!currentMember.areaId) {
        return;
    }

    await ensureAreaCache();
    const area = await getAreaById(currentMember.areaId);
    if (area) {
        saveSelectedAreaLocally(area);
    }
}

async function fetchCurrentMember() {
    const response = await authFetch("/auth/me");
    if (!response.ok) {
        throw new Error("회원 정보를 불러오지 못했습니다.");
    }
    currentMember = await response.json();
    return currentMember;
}

async function setSelectedArea(area) {
    try {
        if (area) {
            await saveMemberArea(area.id);
            areaByIdCache.set(area.id, area);
            saveSelectedAreaLocally(area);
        } else {
            await saveMemberArea(null);
            saveSelectedAreaLocally(null);
        }
    } catch (error) {
        alert(error.message);
    }
}

function updateHeaderAuthUI() {
    const username = getUsernameFromToken();

    if (isLoggedIn() && username) {
        headerUser.textContent = `${username}님`;
        headerUser.classList.remove("hidden");
        btnProfile.classList.remove("hidden");
        btnLogin.classList.add("hidden");
        btnSignup.classList.add("hidden");
        btnLogout.classList.remove("hidden");
        headerSubtitle.textContent = `${username}님의 날씨 일기`;
        return;
    }

    headerUser.classList.add("hidden");
    btnProfile.classList.add("hidden");
    btnLogin.classList.remove("hidden");
    btnSignup.classList.remove("hidden");
    btnLogout.classList.add("hidden");
    updateHeaderSubtitle();
}

function updateHeaderSubtitle() {
    const area = getSelectedArea();
    headerSubtitle.textContent = area
        ? `${area.name}의 하늘과 함께 기록하는 하루`
        : "날씨와 함께 기록하는 하루";
}

function updateFormNote() {
    if (formNote.classList.contains("hidden")) {
        return;
    }

    const area = getSelectedArea();
    formNote.textContent = area
        ? `${area.name} 지역의 날씨가 함께 저장됩니다.`
        : "지역을 선택하면 해당 지역의 날씨가 함께 저장됩니다.";
}

function renderDiarySelectedArea() {
    const area = getSelectedArea();

    if (!area) {
        diaryAreaSelected.classList.add("hidden");
        diaryAreaSelected.innerHTML = "";
        return;
    }

    diaryAreaSelected.classList.remove("hidden");
    diaryAreaSelected.innerHTML = `
        <div class="diary-area-selected-info">
            <strong>${escapeHtml(area.name)}</strong>
            ${area.text ? `<span class="diary-area-selected-memo">${escapeHtml(area.text)}</span>` : ""}
            <span class="diary-area-selected-coords">${formatCoords(area.lat, area.lon)}</span>
        </div>
        <button type="button" class="btn-clear-area" id="btnClearDiaryArea">해제</button>
    `;

    document.getElementById("btnClearDiaryArea").addEventListener("click", () => {
        setSelectedArea(null);
        resetDiaryAreaSearch();
    });
}

async function fetchAllAreas() {
    const response = await fetch("/read/areas");
    if (!response.ok) {
        throw new Error("지역 목록을 불러오지 못했습니다.");
    }
    return response.json();
}

async function ensureAreaCache() {
    if (areaByIdCache.size > 0) {
        return;
    }

    const areas = await fetchAllAreas();
    areaByIdCache = new Map(areas.map((area) => [area.id, area]));
}

async function getAreaById(areaId) {
    await ensureAreaCache();
    return areaByIdCache.get(areaId) || null;
}

async function searchDiaryAreas(name) {
    const params = new URLSearchParams({ name });
    const response = await fetch(`/read/areas/like?${params}`);
    if (!response.ok) {
        throw new Error("지역 검색에 실패했습니다.");
    }
    return response.json();
}

function renderDiaryAreaResults(areas) {
    diaryAreaResults.innerHTML = "";

    if (areas.length === 0) {
        diaryAreaResults.innerHTML = `<li class="area-search-empty">검색 결과가 없습니다.</li>`;
        diaryAreaResults.classList.remove("hidden");
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
            setSelectedArea(area);
            diaryAreaSearchInput.value = "";
            resetDiaryAreaSearch();
        });
        item.appendChild(button);
        diaryAreaResults.appendChild(item);
    });

    diaryAreaResults.classList.remove("hidden");
}

function resetDiaryAreaSearch() {
    diaryAreaResults.classList.add("hidden");
    diaryAreaResults.innerHTML = "";
}

async function performDiaryAreaSearch() {
    const query = diaryAreaSearchInput.value.trim();
    if (!query) {
        resetDiaryAreaSearch();
        return;
    }

    try {
        btnDiaryAreaSearch.disabled = true;
        const areas = await searchDiaryAreas(query);
        renderDiaryAreaResults(areas);
    } catch (error) {
        alert(error.message);
    } finally {
        btnDiaryAreaSearch.disabled = false;
    }
}

function initDiaryAreaSearch() {
    btnDiaryAreaSearch.addEventListener("click", performDiaryAreaSearch);

    diaryAreaSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            performDiaryAreaSearch();
        }
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".area-search-box")) {
            diaryAreaResults.classList.add("hidden");
            profileAreaResults.classList.add("hidden");
        }
    });
}

function renderProfileSelectedArea() {
    if (!profilePendingArea) {
        profileAreaSelected.classList.add("hidden");
        profileAreaSelected.innerHTML = "";
        return;
    }

    profileAreaSelected.classList.remove("hidden");
    profileAreaSelected.innerHTML = `
        <div class="diary-area-selected-info">
            <strong>${escapeHtml(profilePendingArea.name)}</strong>
            ${profilePendingArea.text ? `<span class="diary-area-selected-memo">${escapeHtml(profilePendingArea.text)}</span>` : ""}
            <span class="diary-area-selected-coords">${formatCoords(profilePendingArea.lat, profilePendingArea.lon)}</span>
        </div>
        <button type="button" class="btn-clear-area" id="btnClearProfileArea">해제</button>
    `;

    document.getElementById("btnClearProfileArea").addEventListener("click", () => {
        profilePendingArea = null;
        renderProfileSelectedArea();
        resetProfileAreaSearch();
    });
}

function resetProfileAreaSearch() {
    profileAreaResults.classList.add("hidden");
    profileAreaResults.innerHTML = "";
}

function renderProfileAreaResults(areas) {
    profileAreaResults.innerHTML = "";

    if (areas.length === 0) {
        profileAreaResults.innerHTML = `<li class="area-search-empty">검색 결과가 없습니다.</li>`;
        profileAreaResults.classList.remove("hidden");
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
            profilePendingArea = area;
            renderProfileSelectedArea();
            profileAreaSearchInput.value = "";
            resetProfileAreaSearch();
        });
        item.appendChild(button);
        profileAreaResults.appendChild(item);
    });

    profileAreaResults.classList.remove("hidden");
}

async function performProfileAreaSearch() {
    const query = profileAreaSearchInput.value.trim();
    if (!query) {
        resetProfileAreaSearch();
        return;
    }

    try {
        btnProfileAreaSearch.disabled = true;
        const areas = await searchDiaryAreas(query);
        renderProfileAreaResults(areas);
    } catch (error) {
        alert(error.message);
    } finally {
        btnProfileAreaSearch.disabled = false;
    }
}

async function openProfileModal() {
    try {
        const member = await fetchCurrentMember();
        profileUsername.textContent = member.username;
        profileRoles.textContent = formatRolesDisplay(member.roles);

        profileAreaSearchInput.value = "";
        resetProfileAreaSearch();

        if (member.areaId) {
            await ensureAreaCache();
            profilePendingArea = await getAreaById(member.areaId);
        } else {
            profilePendingArea = getSelectedArea();
        }

        renderProfileSelectedArea();
        profileModal.showModal();
    } catch (error) {
        alert(error.message);
    }
}

function closeProfileModal() {
    profileModal.close();
}

function initProfileModal() {
    btnProfile.addEventListener("click", openProfileModal);
    btnProfileAreaSearch.addEventListener("click", performProfileAreaSearch);
    document.getElementById("btnCloseProfile").addEventListener("click", closeProfileModal);
    document.getElementById("btnCancelProfile").addEventListener("click", closeProfileModal);

    profileAreaSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            performProfileAreaSearch();
        }
    });

    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const areaId = profilePendingArea?.id ?? null;
            await saveMemberArea(areaId);
            if (profilePendingArea) {
                areaByIdCache.set(profilePendingArea.id, profilePendingArea);
                saveSelectedAreaLocally(profilePendingArea);
            } else {
                saveSelectedAreaLocally(null);
            }
            if (currentMember) {
                currentMember.areaId = areaId;
            }
            closeProfileModal();
        } catch (error) {
            alert(error.message);
        }
    });
}

function setMaxDateOnInputs() {
    const today = getTodayString();
    startDateInput.max = today;
    endDateInput.max = today;
}

function parseDateString(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function isFutureMonth(year, month) {
    const today = new Date();
    return year > today.getFullYear()
        || (year === today.getFullYear() && month > today.getMonth());
}

function canGoToNextMonth() {
    let { year, month } = calendarView;
    month += 1;
    if (month > 11) {
        month = 0;
        year += 1;
    }
    return !isFutureMonth(year, month);
}

async function refreshCalendarDiaries() {
    const { year, month } = calendarView;
    const today = getTodayString();
    const start = formatDate(new Date(year, month, 1));

    if (start > today) {
        diaryDatesInMonth = new Set();
        return;
    }

    const monthEnd = formatDate(new Date(year, month + 1, 0));
    const end = monthEnd > today ? today : monthEnd;
    const diaries = await fetchDiaries(start, end);
    diaryDatesInMonth = new Set(diaries.map((diary) => diary.date));
}

function renderCalendar() {
    const { year, month } = calendarView;
    calTitle.textContent = `${year}년 ${month + 1}월`;
    btnCalNext.disabled = !canGoToNextMonth();

    calendarGrid.innerHTML = "";
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = getTodayString();
    const selected = diaryDateInput.value;

    for (let i = 0; i < firstDay; i++) {
        calendarGrid.appendChild(document.createElement("span"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(new Date(year, month, day));
        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";
        button.textContent = day;
        button.dataset.date = dateStr;

        if (dateStr > todayStr) {
            button.classList.add("disabled");
            button.disabled = true;
        }
        if (dateStr === todayStr) {
            button.classList.add("today");
        }
        if (dateStr === selected) {
            button.classList.add("selected");
        }
        if (diaryDatesInMonth.has(dateStr)) {
            button.classList.add("has-diary");
        }

        button.addEventListener("click", () => selectCalendarDate(dateStr));
        calendarGrid.appendChild(button);
    }
}

async function showCalendarForDate(dateStr) {
    const date = parseDateString(dateStr);
    calendarView = { year: date.getFullYear(), month: date.getMonth() };
    await refreshCalendarDiaries();
    renderCalendar();
}

async function selectCalendarDate(dateStr) {
    if (dateStr > getTodayString()) {
        return;
    }

    diaryDateInput.value = dateStr;
    renderCalendar();
    await loadDiaryForSelectedDate();
}

async function changeCalendarMonth(offset) {
    let { year, month } = calendarView;
    month += offset;

    if (month < 0) {
        month = 11;
        year -= 1;
    } else if (month > 11) {
        month = 0;
        year += 1;
    }

    if (isFutureMonth(year, month)) {
        return;
    }

    calendarView = { year, month };
    await refreshCalendarDiaries();
    renderCalendar();
}

function clampToToday(input) {
    const today = getTodayString();
    if (input.value > today) {
        input.value = today;
    }
}

function setDefaultDateRange() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    startDateInput.value = formatDate(start);
    endDateInput.value = getTodayString();
    setMaxDateOnInputs();
}

function showLoading(show) {
    loading.classList.toggle("hidden", !show);
}

async function fetchDiaries(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await authFetch(`/read/diaries?${params}`);
    if (!response.ok) {
        throw new Error("일기를 불러오지 못했습니다.");
    }
    return response.json();
}

async function fetchDiaryByDate(date) {
    return fetchDiaries(date, date);
}

async function createDiary(date, cityName, text) {
    const params = new URLSearchParams({ date });
    const response = await authFetch(`/create/diary?${params}`, {
        method: "POST",
        body: JSON.stringify({ cityName, text }),
    });
    if (!response.ok) {
        throw new Error("일기를 저장하지 못했습니다.");
    }
}

async function updateDiary2(date, cityName, text) {
    const params = new URLSearchParams({ date });
    const response = await authFetch(`/update/diary2?${params}`, {
        method: "PUT",
        body: JSON.stringify({ cityName, text }),
    });
    if (!response.ok) {
        throw new Error("일기를 수정하지 못했습니다.");
    }
}

async function deleteDiary(date) {
    const params = new URLSearchParams({ date });
    const response = await authFetch(`/delete/diary?${params}`, { method: "DELETE" });
    if (!response.ok) {
        throw new Error("일기를 삭제하지 못했습니다.");
    }
}

function renderDiaries(diaries) {
    diaryList.innerHTML = "";

    if (diaries.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    diaries.forEach((diary, index) => {
        const card = document.createElement("article");
        card.className = "diary-card";
        card.style.animationDelay = `${index * 0.05}s`;

        const iconUrl = diary.icon
            ? `https://openweathermap.org/img/wn/${diary.icon}@2x.png`
            : "";
        const area = areaByIdCache.get(diary.areaId);
        const areaLabel = area ? area.name : "";

        card.innerHTML = `
            <div class="diary-card-header">
                <div class="diary-card-meta">
                    <time class="diary-date" datetime="${diary.date}">${formatDisplayDate(diary.date)}</time>
                    ${areaLabel ? `<span class="diary-area-tag">${escapeHtml(areaLabel)}</span>` : ""}
                </div>
                <div class="diary-weather">
                    ${iconUrl ? `<img src="${iconUrl}" alt="${diary.weather || "날씨"}" loading="lazy">` : ""}
                    <div class="weather-info">
                        <div class="weather-main">${diary.weather || "-"}</div>
                        <div class="weather-temp">${kelvinToCelsius(diary.temperature)}°C</div>
                    </div>
                </div>
            </div>
            <p class="diary-text">${escapeHtml(diary.text)}</p>
        `;

        card.addEventListener("click", () => openEditModal(diary.date));
        diaryList.appendChild(card);
    });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

async function loadDiaryForSelectedDate() {
    const date = diaryDateInput.value;
    if (!date) {
        return;
    }

    if (date > getTodayString()) {
        diaryDateInput.value = getTodayString();
        renderCalendar();
    }

    try {
        const diaries = await fetchDiaryByDate(diaryDateInput.value);
        if (diaries.length > 0) {
            const diary = diaries[0];
            editingDate = diaryDateInput.value;
            modalTitle.textContent = "일기 수정";
            diaryTextInput.value = diary.text;
            formNote.classList.add("hidden");
            btnDelete.classList.remove("hidden");

            if (diary.areaId) {
                const area = await getAreaById(diary.areaId);
                if (area) {
                    saveSelectedAreaLocally(area);
                }
            }
        } else {
            editingDate = null;
            modalTitle.textContent = "새 일기";
            diaryTextInput.value = "";
            formNote.classList.remove("hidden");
            btnDelete.classList.add("hidden");
            renderDiarySelectedArea();
            updateFormNote();
        }
    } catch (error) {
        alert(error.message);
    }
}

async function openModal(date) {
    diaryDateInput.value = date || getTodayString();
    diaryAreaSearchInput.value = "";
    resetDiaryAreaSearch();
    renderDiarySelectedArea();
    updateFormNote();
    diaryModal.showModal();
    await showCalendarForDate(diaryDateInput.value);
    await loadDiaryForSelectedDate();
}

function openCreateModal() {
    openModal(getTodayString());
}

function openEditModal(date) {
    openModal(date);
}

function closeModal() {
    diaryModal.close();
}

async function loadDiaries() {
    showLoading(true);
    diaryList.innerHTML = "";
    emptyState.classList.add("hidden");

    try {
        await ensureAreaCache();
        const diaries = await fetchDiaries(startDateInput.value, endDateInput.value);
        renderDiaries(diaries);
    } catch (error) {
        alert(error.message);
        emptyState.classList.remove("hidden");
    } finally {
        showLoading(false);
    }
}

diaryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const date = diaryDateInput.value;
    const text = diaryTextInput.value.trim();
    const area = getSelectedArea();

    if (!text || date > getTodayString()) {
        return;
    }

    if (!area) {
        alert("지역을 선택해 주세요.");
        return;
    }

    try {
        if (editingDate) {
            await updateDiary2(editingDate, area.name, text);
        } else {
            await createDiary(date, area.name, text);
        }
        closeModal();
        await loadDiaries();
    } catch (error) {
        alert(error.message);
    }
});

btnDelete.addEventListener("click", async () => {
    if (!editingDate || !confirm("이 일기를 삭제할까요?")) {
        return;
    }

    try {
        await deleteDiary(editingDate);
        closeModal();
        await loadDiaries();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("btnNewDiary").addEventListener("click", openCreateModal);
document.getElementById("btnEmptyNew").addEventListener("click", openCreateModal);
document.getElementById("btnSearch").addEventListener("click", loadDiaries);
document.getElementById("btnCloseModal").addEventListener("click", closeModal);
document.getElementById("btnCancel").addEventListener("click", closeModal);
btnCalPrev.addEventListener("click", () => changeCalendarMonth(-1));
btnCalNext.addEventListener("click", () => changeCalendarMonth(1));
startDateInput.addEventListener("change", () => clampToToday(startDateInput));
endDateInput.addEventListener("change", () => clampToToday(endDateInput));

btnLogout.addEventListener("click", logout);

initDiaryAreaSearch();
initProfileModal();
if (requireAuth()) {
    updateHeaderAuthUI();
    setDefaultDateRange();
    loadMemberArea().finally(() => {
        loadDiaries();
    });
}
