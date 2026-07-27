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

let editingDate = null;
let calendarView = { year: 0, month: 0 };
let diaryDatesInMonth = new Set();

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
    const response = await fetch(`/read/diaries?${params}`);
    if (!response.ok) {
        throw new Error("일기를 불러오지 못했습니다.");
    }
    return response.json();
}

async function fetchDiary(date) {
    const params = new URLSearchParams({ date });
    const response = await fetch(`/read/diary?${params}`);
    if (!response.ok) {
        throw new Error("일기를 불러오지 못했습니다.");
    }
    return response.json();
}

async function createDiary(date, text) {
    const params = new URLSearchParams({ date });
    const response = await fetch(`/create/diary?${params}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: text,
    });
    if (!response.ok) {
        throw new Error("일기를 저장하지 못했습니다.");
    }
}

async function updateDiary(date, text) {
    const params = new URLSearchParams({ date });
    const response = await fetch(`/update/diary?${params}`, {
        method: "PUT",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: text,
    });
    if (!response.ok) {
        throw new Error("일기를 수정하지 못했습니다.");
    }
}

async function deleteDiary(date) {
    const params = new URLSearchParams({ date });
    const response = await fetch(`/delete/diary?${params}`, { method: "DELETE" });
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

        card.innerHTML = `
            <div class="diary-card-header">
                <time class="diary-date" datetime="${diary.date}">${formatDisplayDate(diary.date)}</time>
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
        const diaries = await fetchDiary(diaryDateInput.value);
        if (diaries.length > 0) {
            editingDate = diaryDateInput.value;
            modalTitle.textContent = "일기 수정";
            diaryTextInput.value = diaries[0].text;
            formNote.classList.add("hidden");
            btnDelete.classList.remove("hidden");
        } else {
            editingDate = null;
            modalTitle.textContent = "새 일기";
            diaryTextInput.value = "";
            formNote.classList.remove("hidden");
            btnDelete.classList.add("hidden");
        }
    } catch (error) {
        alert(error.message);
    }
}

async function openModal(date) {
    diaryDateInput.value = date || getTodayString();
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
    if (!text || date > getTodayString()) {
        return;
    }

    try {
        if (editingDate) {
            await updateDiary(editingDate, text);
        } else {
            await createDiary(date, text);
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

setDefaultDateRange();
loadDiaries();
