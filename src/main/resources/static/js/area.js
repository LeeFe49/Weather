const SELECTED_AREA_KEY = "weather.selectedArea";

const areaTab = document.getElementById("areaTab");
const areaSearchInput = document.getElementById("areaSearch");
const areaList = document.getElementById("areaList");
const areaEmpty = document.getElementById("areaEmpty");
const areaLoading = document.getElementById("areaLoading");
const selectedAreaCard = document.getElementById("selectedAreaCard");
const areaModal = document.getElementById("areaModal");
const areaForm = document.getElementById("areaForm");
const areaEditName = document.getElementById("areaEditName");
const areaEditCoords = document.getElementById("areaEditCoords");
const areaEditText = document.getElementById("areaEditText");
const headerSubtitle = document.getElementById("headerSubtitle");
const diaryAreaPreview = document.getElementById("diaryAreaPreview");

let editingAreaName = null;
let searchTimer = null;

function getSelectedArea() {
    const raw = localStorage.getItem(SELECTED_AREA_KEY);
    return raw ? JSON.parse(raw) : null;
}

function setSelectedArea(area) {
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
    updateSelectedAreaUI();
}

function formatCoords(lat, lon) {
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
}

function updateSelectedAreaUI() {
    const selected = getSelectedArea();

    if (selected) {
        const label = selected.text ? `${selected.name} (${selected.text})` : selected.name;
        headerSubtitle.textContent = `${label}의 하늘과 함께 기록하는 하루`;
        renderSelectedAreaCard(selected);
        renderDiaryAreaPreview(selected);
    } else {
        headerSubtitle.textContent = "지역을 선택하고 하루를 기록해 보세요";
        selectedAreaCard.innerHTML = `
            <p class="area-selected-empty">아직 선택된 지역이 없습니다. 아래 목록에서 지역을 선택해 주세요.</p>
        `;
        renderDiaryAreaPreview(null);
    }

    renderAreaListHighlight();
}

function renderSelectedAreaCard(area) {
    selectedAreaCard.innerHTML = `
        <div class="area-selected-info">
            <span class="area-selected-label">현재 선택 지역</span>
            <strong class="area-selected-name">${escapeHtml(area.name)}</strong>
            ${area.text ? `<span class="area-selected-memo">${escapeHtml(area.text)}</span>` : ""}
            <span class="area-selected-coords">${formatCoords(area.lat, area.lon)}</span>
        </div>
        <span class="badge badge-ready">일기 연동 준비됨</span>
    `;
}

function renderDiaryAreaPreview(area) {
    if (!diaryAreaPreview) {
        return;
    }

    if (!area) {
        diaryAreaPreview.innerHTML = `
            <span class="area-preview-empty">지역 탭에서 지역을 선택해 주세요.</span>
        `;
        return;
    }

    diaryAreaPreview.innerHTML = `
        <div class="area-preview-main">
            <strong>${escapeHtml(area.name)}</strong>
            ${area.text ? `<span class="area-preview-memo">${escapeHtml(area.text)}</span>` : ""}
        </div>
        <span class="area-preview-coords">${formatCoords(area.lat, area.lon)}</span>
    `;
}

function renderAreaListHighlight() {
    const selected = getSelectedArea();
    areaList.querySelectorAll(".area-item").forEach((item) => {
        item.classList.toggle("selected", selected && item.dataset.name === selected.name);
    });
}

function showAreaLoading(show) {
    areaLoading.classList.toggle("hidden", !show);
}

async function fetchAreas() {
    const response = await fetch("/read/areas");
    if (!response.ok) {
        throw new Error("지역 목록을 불러오지 못했습니다.");
    }
    return response.json();
}

async function searchAreas(name) {
    const params = new URLSearchParams({ name });
    const response = await fetch(`/read/areas/like?${params}`);
    if (!response.ok) {
        throw new Error("지역 검색에 실패했습니다.");
    }
    return response.json();
}

async function syncAreasFromSource() {
    const response = await fetch("/update/areas", { method: "POST" });
    if (!response.ok) {
        throw new Error("지역 목록을 가져오지 못했습니다.");
    }
    return response.json();
}

async function updateArea(name, text) {
    const params = new URLSearchParams({ name, text });
    const response = await fetch(`/update/area?${params}`, { method: "PUT" });
    if (!response.ok) {
        throw new Error("지역 정보를 수정하지 못했습니다.");
    }
    return response.json();
}

function renderAreaList(areas) {
    areaList.innerHTML = "";

    if (areas.length === 0) {
        areaEmpty.classList.remove("hidden");
        return;
    }

    areaEmpty.classList.add("hidden");

    areas.forEach((area) => {
        const item = document.createElement("article");
        item.className = "area-item";
        item.dataset.name = area.name;

        item.innerHTML = `
            <div class="area-item-info">
                <strong class="area-item-name">${escapeHtml(area.name)}</strong>
                ${area.text ? `<span class="area-item-memo">${escapeHtml(area.text)}</span>` : ""}
                <span class="area-item-coords">${formatCoords(area.lat, area.lon)}</span>
            </div>
            <div class="area-item-actions">
                <button type="button" class="btn btn-secondary btn-sm area-select-btn">선택</button>
                <button type="button" class="btn btn-ghost btn-sm area-edit-btn">수정</button>
            </div>
        `;

        item.querySelector(".area-select-btn").addEventListener("click", () => {
            setSelectedArea(area);
        });
        item.querySelector(".area-edit-btn").addEventListener("click", () => {
            openAreaEditModal(area);
        });

        areaList.appendChild(item);
    });

    renderAreaListHighlight();
}

async function loadAreas(query = "") {
    showAreaLoading(true);
    areaEmpty.classList.add("hidden");

    try {
        const areas = query.trim()
            ? await searchAreas(query.trim())
            : await fetchAreas();
        renderAreaList(areas);
    } catch (error) {
        alert(error.message);
        areaEmpty.classList.remove("hidden");
    } finally {
        showAreaLoading(false);
    }
}

function openAreaEditModal(area) {
    editingAreaName = area.name;
    areaEditName.textContent = area.name;
    areaEditCoords.textContent = formatCoords(area.lat, area.lon);
    areaEditText.value = area.text || "";
    areaModal.showModal();
}

function closeAreaModal() {
    areaModal.close();
    editingAreaName = null;
}

async function saveAreaEdit() {
    const text = areaEditText.value.trim();
    const updated = await updateArea(editingAreaName, text);

    const selected = getSelectedArea();
    if (selected && selected.name === updated.name) {
        setSelectedArea(updated);
    }

    closeAreaModal();
    await loadAreas(areaSearchInput.value);
}

function initTabs() {
    document.querySelectorAll(".tab-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const tab = button.dataset.tab;

            document.querySelectorAll(".tab-btn").forEach((item) => {
                item.classList.toggle("active", item.dataset.tab === tab);
            });
            document.getElementById("diaryTab").classList.toggle("hidden", tab !== "diary");
            areaTab.classList.toggle("hidden", tab !== "area");

            if (tab === "area") {
                await loadAreas(areaSearchInput.value);
            }
        });
    });
}

document.getElementById("btnSyncAreas").addEventListener("click", async () => {
    if (!confirm("OpenWeatherMap 도시 목록을 DB에 불러올까요?")) {
        return;
    }

    showAreaLoading(true);
    try {
        await syncAreasFromSource();
        areaSearchInput.value = "";
        await loadAreas();
    } catch (error) {
        alert(error.message);
    } finally {
        showAreaLoading(false);
    }
});

areaSearchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        loadAreas(areaSearchInput.value);
    }, 300);
});

areaForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        await saveAreaEdit();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("btnCloseAreaModal").addEventListener("click", closeAreaModal);
document.getElementById("btnCancelArea").addEventListener("click", closeAreaModal);

initTabs();
updateSelectedAreaUI();
