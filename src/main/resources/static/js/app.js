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

let editingDate = null;

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

function setDefaultDateRange() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    startDateInput.value = formatDate(start);
    endDateInput.value = formatDate(today);
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

function openCreateModal() {
    editingDate = null;
    modalTitle.textContent = "새 일기";
    diaryDateInput.value = formatDate(new Date());
    diaryDateInput.disabled = false;
    diaryTextInput.value = "";
    formNote.classList.remove("hidden");
    btnDelete.classList.add("hidden");
    diaryModal.showModal();
}

async function openEditModal(date) {
    try {
        const diaries = await fetchDiary(date);
        if (diaries.length === 0) {
            return;
        }

        const diary = diaries[0];
        editingDate = date;
        modalTitle.textContent = "일기 수정";
        diaryDateInput.value = date;
        diaryDateInput.disabled = true;
        diaryTextInput.value = diary.text;
        formNote.classList.add("hidden");
        btnDelete.classList.remove("hidden");
        diaryModal.showModal();
    } catch (error) {
        alert(error.message);
    }
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
    if (!text) {
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

setDefaultDateRange();
loadDiaries();
