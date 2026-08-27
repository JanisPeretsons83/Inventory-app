let data = [];
let analysisData = [];
let analysisFiles = [];
let selectedMaterial = "egle";
let expandedDimension = null;
let editIndex = null;
let currentLocation = null;
let isGaliMode = false;
let dimensionsLibrary = [];
let importedBackup = null;
let importedAreaSummary = null;
let dataChanged = false;
let expandedArea = null;
let expandedAreaEntries = null;
let expandedSize = null;
let areaPhotos = {};
let currentArea = null;
let previousArea = null;
let photoTargetArea = null;
let photoBusy = false;

function loadAreaPhotos() {
    try {
        const saved = localStorage.getItem("areaPhotos");
            if (!saved) {areaPhotos = {};
                return;
                }
        const parsed = JSON.parse(saved);
            if (parsed &&
                typeof parsed === "object" &&
                    !Array.isArray(parsed)
                ) {areaPhotos = parsed;
            } else {areaPhotos = {};}
            } catch (error) {
                console.error(
                    "❌ Neizdevās ielādēt areaPhotos:",
                error
                );
        areaPhotos = {};
        }    
}
loadAreaPhotos();

// ✅ Login

let selectedBtn = null;
const areasByLocation = {

  "Dārdu": [
    "2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "3-1", "3-2", "3-3", "3-4",
    "3-5", "3-6", "3-7", "4-1", "5-1", "5-2", "6-1", "7-1", "7-2", "7-3",
    "7-4", "7-5", "7-6", "9-1", "9-2", "9-3", "9-4", "9-5", "9-6", "9-7",
    "9-8", "9-9", "9-10", "9-11", "9-12", "9-13", "9-14", "9-15", "10-1",
    "10-2", "10-3", "10-4", "10-5", "10-6", "10-7", "10-8", "11-1", "11-2",
    "11-3", "11-4", "11-5", "12-1", "12-2", "12-3", "12-4", "12-5"
  ],

  "Cecīļu": [
    "2-1", "3-1", "4-1", "4-2", "4-3", "6-1", "6-2", "7-1", "7-2", "7-3", "8-1", "8-2", "8-3",
    "8-4", "8-5", "8-6", "8-7", "9-1", "9-2", "9-3", "9-4", "9-5", "9-6", "9-7", "9-8", "9-9", "9-10",
    "9-11", "9-12", "11-1", "11-2", "11-3", "11-4", "11-5", "11-6", "11-7", "11-8", "11-9", "11-10",
    "11-11", "11-12", "11-13", "11-14", "11-15", "ZM", "B-L", "D-L", "N-1", "N-2", "N-3",
    "N-4", "N-5", "N-6", "N-7", "N-8", "N-9", "P-N"
  ]

};

const betaUsers = [
  "jānis pētersons"
  ];

    // --------------------------------------------------
    //APGABALA MAIŅA
    // --------------------------------------------------
    function handleAreaChange() {
    const areaSelect =
        document.getElementById("area");
    if (!areaSelect) {
        return;
    }
    const newArea =
        areaSelect.value;
    // Ja nekas nav izvēlēts
    if (!newArea) {
        currentArea = null;
        previousArea = null;
        photoTargetArea = null;
        renderAreaPhotoPanel(null);
        return;
    }
    // --------------------------------------------------
    // Pārbauda iepriekšējo apgabalu
    // --------------------------------------------------
    if (
        previousArea &&
        previousArea !== newArea
    ) {
        const hasEntries =
            data.some(
                e => e.area === previousArea
            );
        const hasPhoto =
            hasAreaPhoto(previousArea);
        // Iepriekšējam apgabalam ir dati,
        // bet nav foto
        if (
            hasEntries &&
            !hasPhoto
        ) {
            console.log(
                "📷 Foto pieprasījums:",
                previousArea
            );
            const addPhoto = confirm(
                `Apgabalam ${previousArea} nav foto.\n\n` +
                `Vai vēlies pievienot foto?`
            );
            if (addPhoto) {
                currentArea = previousArea;
                photoTargetArea = previousArea;
                const input =
                    document.getElementById(
                        "areaPhotoInput"
                    );
                if (input) {
                    input.value = "";
                    input.click();
                }
            }
        }
    }
    // --------------------------------------------------
    // Jaunais apgabals kļūst par aktīvo
    // --------------------------------------------------
    currentArea = newArea;
    previousArea = newArea;
    photoTargetArea = newArea;
    console.log(
        "📍 Aktīvais apgabals:",
        currentArea
    );
    console.log(
        "📷 Foto:",
        hasAreaPhoto(currentArea)
            ? "IR"
            : "NAV"
    );
    renderAreaPhotoPanel(
        currentArea
    );
}
    // --------------------------------------------------
    // Saglabā izvēlētā apgabala foto
    // --------------------------------------------------
    function saveAreaPhoto(event) {
        if (photoBusy) {
            return;
            }
        const input = event.target;
        const file = input.files &&
            input.files[0];
        if (!file) {
            return;
        }
        const targetArea =
            photoTargetArea ||
            currentArea;
        if (!targetArea) {
            showNotice(
                "⚠️ Nav izvēlēts apgabals!",
                "error");
            input.value = "";
        return;
        }
    // Pārbauda faila tipu
        if (!file.type.startsWith("image/")) {
            showNotice(
                "❌ Lūdzu izvēlies attēla failu!",
                "error");
            input.value = "";
        return;
        }
    // Maksimālais oriģinālā faila izmērs
        const maxFileSize = 15 * 1024 * 1024;
            if (file.size > maxFileSize) {
                showNotice(
                    "❌ Foto fails ir pārāk liels. " +
                    "Maksimums 15 MB.",
                    "error");
                input.value = "";
            return;
            }
            photoBusy = true;
        const img = new Image();
        const reader = new FileReader();
            reader.onload =
        function (e) {
            img.onload =
                function () {
                    try {
                        // --------------------------------------------------
                        // Maksimālais attēla platums/augstums
                        // --------------------------------------------------
                        const maxSize = 600;
                            let width = img.naturalWidth || img.width;
                            let height = img.naturalHeight || img.height;
                        const scale = Math.min(1,
                                maxSize / width,
                                maxSize / height
                            );
                        width = Math.round(width * scale);
                        height = Math.round(height * scale);
                        // --------------------------------------------------
                        // Canvas
                        // --------------------------------------------------
                        const canvas = document.createElement("canvas");
                            canvas.width = width;
                            canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        if (!ctx) {
                            throw new Error(
                                "Canvas nav pieejams");
                        }
                        // Balts fons JPEG gadījumā
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, width, height
                        );
                        ctx.drawImage(img, 0, 0, width, height);
                        // --------------------------------------------------
                        // JPEG
                        // --------------------------------------------------
                        const photo =
                            canvas.toDataURL("image/jpeg", 0.5);
                        if (
                            !photo ||
                            photo === "data:,") {
                            throw new Error(
                                "Foto konvertēšana neizdevās"
                            );
                        }
                        // --------------------------------------------------
                        // Saglabā konkrētajam apgabalam
                        // --------------------------------------------------
                        areaPhotos[targetArea] = photo;
                        // --------------------------------------------------
                        // localStorage
                        // --------------------------------------------------
                        const saved =
                            saveAreaPhotosStorage();
                        if (!saved) {
                            // Ja saglabāšana neizdevās,
                            // atceļ izmaiņu
                            delete areaPhotos[targetArea];
                            return;
                        }
                        dataChanged = true;
                        // Aktīvais apgabals
                        currentArea = targetArea;
                        previousArea = document.getElementById("area")
                            ?.value || targetArea;
                        // --------------------------------------------------
                        // Pārzīmē foto paneli
                        // --------------------------------------------------
                        renderAreaPhotoPanel(targetArea);
                        // --------------------------------------------------
                        // Importēšanas skats
                        // --------------------------------------------------
                        if (
                            typeof renderImportAreas ===
                                "function" &&
                            importedBackup &&
                            importedAreaSummary) {
                            renderImportAreas();
                        }
                        console.log("📷 Foto saglabāts:",
                            targetArea
                        );
                        console.log("📷 Visi foto:",
                            Object.keys(areaPhotos)
                        );
                        showNotice(
                            `📷 Foto pievienots apgabalam ${targetArea}`,
                            "success");
                    } catch (error) {
                        console.error(
                            "❌ Foto apstrādes kļūda:",
                            error);
                        showNotice(
                            "❌ Neizdevās apstrādāt foto.",
                            "error");
                    } finally {
                        photoBusy = false;
                        input.value = "";}
                };
            img.onerror =
                function () {
                    photoBusy = false;
                    input.value = "";
                    showNotice(
                        "❌ Neizdevās ielādēt attēlu!",
                        "error");
                };
            img.src = e.target.result;
        };
    reader.onerror =
        function () {
            photoBusy = false;
            input.value = "";
            showNotice(
                "❌ Neizdevās nolasīt foto failu!",
                "error");
        };
    reader.readAsDataURL(file);
}

function renderAreaPhotoPanel(area) {
    const panel =
        document.getElementById(
            "areaPhotoPanel"
        );
    if (!panel) {
        return;
    }
    if (
        (!area)
    ) {
        panel.innerHTML = "";
        panel.style.display = "none";
        return;
    }
    panel.style.display =
        "block";
    const photo =
        areaPhotos[area];
    if (photo) {
        panel.innerHTML = `
            <div class="areaPhotoTitle">
                📷 Apgabala ${area} foto
            </div>
            <div class="areaPhotoContent">
                <div class="areaPhotoPreview">
                    <img
                        src="${photo}"
                        alt="Apgabala ${area} foto"
                        onclick="viewAreaPhoto('${area}')">
                </div>
                <div class="areaPhotoButtons">
                    <button
                        type="button"
                        onclick="chooseAreaPhoto('${area}')">
                        🔄 Nomainīt
                    </button>
                    <button
                        type="button"
                        onclick="deleteAreaPhoto('${area}')">
                        🗑 Dzēst
                    </button>
                </div>
            </div> `;
    } else {
        panel.innerHTML = `
            <div class="areaPhotoTitle">
                📷 Apgabala ${area} foto
            </div>
        <div class="areaPhotoContent">
            <div class="areaPhotoPreview areaPhotoPlaceholder">
                📷 Foto<br>nav<br>pievienots
            </div>
            <div class="areaPhotoButtons">
                <button
                    type="button"
                    onclick="chooseAreaPhoto('${area}')">
                    📷 Pievienot<br>foto
                </button>
            </div>
        </div>
        `;
    }
}

function updateAreas() {
  const location = localStorage.getItem("location");
  const select = document.getElementById("area");
    select.innerHTML = `<option value="">Apgabals *</option>`;
      (areasByLocation[location] || []).forEach(a => {
        const opt = document.createElement("option");
          opt.value = a;
          opt.textContent = a;
          select.appendChild(opt);
      });
    previousArea =
        document.getElementById("area").value;
}

function startDataViewMode() {
  analysisData = [];
  analysisFiles = [];
  expandedDimension = null;
    document.getElementById("analysisInfo").innerHTML = "";
    document.getElementById("analysisView").innerHTML = "";
    document.getElementById("analysisBackupFile").value = "";
    document.getElementById("locationSelect").style.display = "none";
    document.getElementById("appContent").style.display = "none";
    document.getElementById("analyticsContent").style.display = "block";
}

function openAnalysisBackupFile() {
  document
    .getElementById("analysisBackupFile")
    .click();
}

async function importAnalysisBackup(event) {
  const files = [...event.target.files];
    if (!files.length) return;
  const backups = [];
    for (const file of files) {
      let backup;
      try {
        const text = await file.text();
          backup = JSON.parse(text);
        } catch (error) {
          alert(`Fails "${file.name}" nav derīgs JSON fails!`);
          return;
        }
      if (!backup || typeof backup !== "object") {
        alert(`Fails "${file.name}" nav derīgs backup fails!`);
        return;
        }
      if (!Array.isArray(backup.entries)) {
        alert(`Failā "${file.name}" nav derīgu entries datu!`);
        return;
        }
        backups.push(backup);
    }
  const baseLocation =
    backups[0].location;
  const users =
    [...new Set(
      backups.map(b => b.user)
    )];
  const baseMonth =
    backups[0].inventoryMonth;
  const baseYear =
    backups[0].inventoryYear;
  const invalidFile =
    backups.find(b =>
      b.location !== baseLocation ||
      b.inventoryMonth !== baseMonth ||
      b.inventoryYear !== baseYear
    );
    if (invalidFile) {
    alert(
      "Izvēlētie faili ir no dažādām ražotnēm vai periodiem!"
      );
    return;
    }
    analysisData = [];
      backups.forEach(backup => {
        analysisData.push(
        ...backup.entries
        );
      });
    const groups = {};  
      analysisData.forEach(e => {
    const key =
      `${e.thickness}x${e.width}`;
    if (!groups[key]) {
      groups[key] = {
        packages: 0,
        totalM3: 0,
        rows: []
        };
      }
      groups[key].packages += e.packages || 0;
      groups[key].totalM3 += e.total || 0;
      groups[key].rows.push(e);
  });  
  const totalPackages =
    analysisData.reduce(
      (sum, e) => sum + (e.packages || 0),
      0
    );
  const totalM3 =
    analysisData.reduce(
      (sum, e) => sum + (e.total || 0),
      0
    );
    document.getElementById("analysisInfo")
      .innerHTML = `
    <h3>📊 Kopsavilkums</h3>
    Ražotne:
      ${baseLocation}<br>
    Lietotāji:<br>
      ${users.join("<br>")}<br><br>
    Datu reģistrācija:
      ${String(baseMonth).padStart(2, "0")}.${baseYear}<br>
    Faili:
      ${backups.length}<br>
    Ieraksti:
      ${analysisData.length}<br>
    Paletes:
      ${totalPackages}<br>
    m³:
      ${totalM3.toFixed(4)}
    `;
  renderDimensionAnalysis();
}

function setMaterialFilter(type) {
  selectedMaterial = type;
  expandedDimension = null;
  document
    .querySelectorAll(".materialTabs button")
    .forEach(btn =>
  btn.classList.remove("active")
    );
  document
    .getElementById(`mat_${type}`)
    .classList.add("active");
  renderDimensionAnalysis();
}

function renderDimensionAnalysis() {
  let filteredData = analysisData;
    const groups = {};
  if (selectedMaterial === "egle") {
    filteredData = analysisData.filter(e =>
      e.comment !== "Lapegle" &&
      e.comment !== "Termokoks"
    );
  } else if (selectedMaterial === "lapegle") {
    filteredData = analysisData.filter(e =>
      e.comment === "Lapegle"
    );
  } else if (selectedMaterial === "termokoks") {
    filteredData = analysisData.filter(e =>
      e.comment === "Termokoks"
    );
  }

  filteredData.forEach(e => {
    const key = `${e.thickness}x${e.width}`;
    if (!groups[key]) {
      groups[key] = {
        packages: 0,
        totalM3: 0,
        rows: []
      };
    }

    groups[key].packages += e.packages || 0;
    groups[key].totalM3 += e.total || 0;
    groups[key].rows.push(e);
  });

  let html = `
    <table>
      <thead>
        <tr>
          <th>Dimensija</th>
          <th>Pakas</th>
          <th>m³</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.entries(groups)
    .sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true })
    )
    .forEach(([size, info]) => {

      html += `
        <tr>
          <td onclick="toggleDimension('${size}')"
              style="cursor:pointer;">
            ${expandedDimension === size ? "▼" : "▶"} ${size}
          </td>
          <td>${info.packages}</td>
          <td>${info.totalM3.toFixed(4)}</td>
        </tr>
      `;

      if (expandedDimension === size) {
        info.rows.forEach(row => {

          const lengthText =
            String(row.length).toLowerCase() === "gali"
              ? `≈${row.avgLength} mm`
              : `${row.length} mm`;

          const productionDate =
            `${String(row.month).padStart(2, "0")}.${String(row.year).slice(-2)}`;

          html += `
            <tr class="detailRow">
              <td colspan="3">
                ${row.area} |
                ${row.grade} |
                ${lengthText} |
                ${row.packages} pal. |
                ${row.pieces} gab. |
                ${productionDate} |
                ${row.total.toFixed(3)} m³
              </td>
            </tr>
          `;
        });
      }
    });

  html += `
      </tbody>
    </table>
  `;

  document.getElementById("analysisView").innerHTML = html;
}

function toggleArea(area) {
    expandedArea =
        expandedArea === area
            ? null
            : area;
    expandedAreaEntries = null;
    expandedSize = null;
    renderImportAreas();
}

function toggleAreaEntries(area) {
    expandedAreaEntries =
        expandedAreaEntries === area
            ? null
            : area;
    expandedSize = null;
    renderImportAreas();
}

function toggleSize(area, size) {
    const key =
        `${area}_${size}`;
    expandedSize =
        expandedSize === key
            ? null
            : key;
    renderImportAreas();
}

function toggleDimension(size) {
  if (expandedDimension === size) {
    expandedDimension = null;
  } else {
    expandedDimension = size;
    }
  renderDimensionAnalysis();
}

function closeDataViewMode() {
  analysisFiles = [];
  analysisData = [];
  expandedDimension = null;
  selectedMaterial = "egle";
    // Notīra kopsavilkumu
    document.getElementById("analysisInfo").innerHTML = "";
    // Notīra analītikas saturu
    document.getElementById("analysisView").innerHTML = "";
    // Notīra izvēlētos backup failus
    document.getElementById("analysisBackupFile").value = "";
    // Aizver analītikas skatu
    document.getElementById("analyticsContent").style.display = "none";
    // Atgriežas Login logā
    document.getElementById("locationSelect").style.display = "block";
}

function showNotice(message, type = "info", fieldId = null) {
  const notice = document.getElementById("notice");
    notice.className = "";
    notice.classList.add("notice-" + type);
    notice.innerText = message;
    notice.style.display = "block";
      setTimeout(() => {
    notice.classList.add("show");
    }, 10);
      clearTimeout(notice.timer);
    notice.timer = setTimeout(() => {
    notice.classList.remove("show");
      setTimeout(() => {
    notice.style.display = "none";
  if (fieldId) {
  const field =
    document.getElementById(fieldId);
  if (field) {
    field.scrollIntoView({
      behavior: "smooth",
      block: "center"
      });
    field.focus();
            }
          }
        }, 250);
      }, 1000);
}

  function toggleGali() {
    isGaliMode = !isGaliMode;
  
    const block = document.getElementById("galiInputs");
    const calcInfo = document.getElementById("calcInfo");
    const btn = document.getElementById("galiBtn");
    const lengthInput = document.getElementById("length");
  
  if (isGaliMode) {
    block.style.display = "block";
    calcInfo.style.display = "block";
    btn.classList.add("active");
    // ✅ Garums nav rediģējams
    lengthInput.disabled = true;
    lengthInput.value = "";
  } else {
    block.style.display = "none";
    calcInfo.style.display = "none";
    btn.classList.remove("active");
    // ✅ Atkal ļauj ievadīt garumu
    lengthInput.disabled = false;
    }
  }

function showSizeSuggestions() {
  const thickness =
    document.getElementById("thickness").value.trim();
  const container =
    document.getElementById("sizeSuggestions");
    container.innerHTML = "";
  if (!thickness) {
    container.style.display = "none";
  return;
  }
  const matches = dimensionsLibrary.filter(size =>
    size.startsWith(thickness + "x")
    )
    .slice(0, 20);
  if (matches.length === 0) {
    container.style.display = "none";
  return;
    }
    matches.forEach(size => {
  const div = document.createElement("div");
    div.className = "sizeOption";
    div.textContent = size;
    div.onclick = () => {
  const parts = size.split("x");
    document.getElementById("thickness").value =
      parts[0];
    document.getElementById("width").value =
      parts[1];
        container.innerHTML = "";
        container.style.display = "none";
    document.getElementById("length").focus();
};
    container.appendChild(div);
  });
    container.style.display = "block";
}

function updateMaps() {
  const location = localStorage.getItem("location");
  const container = document.getElementById("mapLinks");
  const BASE_PATH = "/Inventory-app";

  container.innerHTML = ""; // notīra iepriekšējo

  if (location === "Dārdu") {
    container.innerHTML = `
      <a href="#" onclick="openImageFromSrc('${BASE_PATH}/dardu_map1.jpeg'); return false;">
        📍 Karte 1
      </a>
      <a href="#" onclick="openImageFromSrc('${BASE_PATH}/dardu_map2.jpeg'); return false;">
        📍 Karte 2
      </a> 
      `;
  } else if (location === "Cecīļu") {
    container.innerHTML = `
      <a href="#" onclick="openImageFromSrc('${BASE_PATH}/cecilu_map.jpeg'); return false;">
        📍 Karte
      </a> 
      `;
  }
}

function openImageFromSrc(src) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
    modal.style.display = "block";
    modalImg.src = src;
}

    // ✅ aizver uz klikšķa

    document.getElementById("imageModal").onclick = function () {
      this.style.display = "none";
};

function setLocation(loc, btn) {
      currentLocation = loc;
      localStorage.setItem("location", loc);
      // ✅ noņem highlight no iepriekšējās
  if (selectedBtn) {
      selectedBtn.classList.remove("activeLocation");
  }

      // ✅ uzliek highlight jaunajai
      btn.classList.add("activeLocation");
      selectedBtn = btn;
}

function openImage(img) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");

  modal.style.display = "block";
  modalImg.src = img.src;
}

function setHeaderInfo() {
  const name = localStorage.getItem("userName") || "";
  const location = localStorage.getItem("location") || "";
  const d = new Date();
  const date =
    String(d.getDate()).padStart(2, "0") + "." +
    String(d.getMonth() + 1).padStart(2, "0") + "." +
    d.getFullYear();

  document.getElementById("infoLine").innerText =
    `${location} | ${name} | ${date}`;
}

function saveUser() {
  localStorage.setItem("sessionStart", Date.now());
  const name = document.getElementById("userNameInput").value.trim();
  const location = localStorage.getItem("location");
    if (!location) {
      showNotice(
        "⚠️ Izvēlies ražotni",
        "error"
        );
      return;
    }
    if (!name) {
      showNotice(
        "⚠️ Ievadi vārdu",
        "error"
        );
    return;
  }

  // ✅ saglabā
  localStorage.setItem("userName", name);

  // ✅ PARĀDA APP
  document.getElementById("locationSelect").style.display = "none";
  document.getElementById("appContent").style.display = "block";
  
  // ✅ header info
  setHeaderInfo();
  updateAreas();
  updateMaps();
    currentArea = null;
    previousArea = null;
    photoTargetArea = null;
        renderAreaPhotoPanel(null);
  checkBetaAccess();
}

function safeFileName(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_");
}

// ✅ AUTOMĀTISKI GADS

function updateYearFromMonth() {
    const month =
      Number(document.getElementById("month").value);
  if (!month) return;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const year =
      month > currentMonth
      ? currentYear - 1
      : currentYear;
    document.getElementById("year").value = year;
}

// ✅ PIEVIENO IERAKSTU
function add() {
  const areaVal = document.getElementById("area").value.trim();
  const packagesVal = Number(document.getElementById("packages").value);
  const thicknessVal = Number(document.getElementById("thickness").value);
  const widthVal = Number(document.getElementById("width").value);
  const monthVal = Number(document.getElementById("month").value);
  const yearVal = Number(document.getElementById("year").value);
  if (!areaVal)
    return error("Apgabals obligāts", "area");
  if (packagesVal <= 0 || isNaN(packagesVal))
    return error("Pakas obligātas", "packages");
  if (thicknessVal <= 0 || isNaN(thicknessVal))
    return error("Biezums obligāts", "thickness");
  if (widthVal <= 0 || isNaN(widthVal))
    return error("Platums obligāts", "width");
  const size = `${thicknessVal}x${widthVal}`;
  // Izmēru saglabāšana bibliotēkā
  dimensionsLibrary = Array.isArray(dimensionsLibrary)
    ? dimensionsLibrary
    : [];
  dimensionsLibrary = dimensionsLibrary.filter(
    s => s !== size
  );
  dimensionsLibrary.unshift(size);
  localStorage.setItem(
    "dimensionsLibrary",
    JSON.stringify(dimensionsLibrary)
  );
  if (!monthVal || monthVal < 1 || monthVal > 12)
    return error("Mēnesis 1–12", "month");
  if (!yearVal)
    return error("Gads obligāts", "year");
  if (!document.getElementById("grade").value)
    return error("Izvēlies šķiru", "gradeBtn");
  let rawLength =
    document.getElementById("length").value.trim();
  if (isGaliMode) {
    rawLength = "gali";
  }
  let lengthVal = rawLength.toLowerCase();
  let totalM3 = 0;
  let m3PerPack = 0;
  let packWidth = null;
  let packLength = null;
  let packHeight = null;
  let piecesPerPack = null;
  let avgLength = null;
  // ==========================================
  // GALI REŽĪMS
  // ==========================================
  if (lengthVal === "gali") {
    packWidth =
      Number(document.getElementById("packWidth").value);
    packLength =
      Number(document.getElementById("packLength").value);
    packHeight =
      Number(document.getElementById("packHeight").value);
    avgLength =
      Number(document.getElementById("avgLength").value);
    if (packWidth <= 0 || isNaN(packWidth))
      return error(
        "Pakas platums obligāts",
        "packWidth"
      );
    if (packLength <= 0 || isNaN(packLength))
      return error(
        "Pakas garums obligāts",
        "packLength"
      );
    if (packHeight <= 0 || isNaN(packHeight))
      return error(
        "Pakas augstums obligāts",
        "packHeight"
      );
    if (avgLength <= 0 || isNaN(avgLength))
      return error(
        "Vidējais garums obligāts",
        "avgLength"
      );
    // Pakas tilpums m³
    m3PerPack =
      (packWidth * packLength * packHeight) /
      1000000000;
    const piecesAcrossWidth =
      Math.floor(packWidth / widthVal);
    const piecesAcrossHeight =
      Math.floor(packHeight / thicknessVal);
    const piecesFront =
      piecesAcrossWidth * piecesAcrossHeight;
    const columns =
      Math.floor(packLength / avgLength);
    const efficiency = 0.95;
    piecesPerPack = Math.max(
      1,
      Math.floor(
        piecesFront *
        columns *
        efficiency
      )
    );
    // Parāda ar ≈
    document.getElementById("pieces").value =
      "≈ " + piecesPerPack;
    totalM3 =
      m3PerPack * packagesVal;
  } else {
    // ==========================================
    // PARASTAIS REŽĪMS
    // ==========================================
    const lengthNum = Number(rawLength);
    const piecesVal =
      Number(
        document.getElementById("pieces").value
      );
    if (lengthNum <= 0 || isNaN(lengthNum))
      return error(
        "Garums nav pareizs",
        "length"
      );
    if (piecesVal <= 0 || isNaN(piecesVal))
      return error(
        "Gabali pakā obligāti",
        "pieces"
      );
    piecesPerPack = piecesVal;
    m3PerPack =
      (
        thicknessVal *
        widthVal *
        lengthNum *
        piecesVal
      ) / 1000000000;
    totalM3 =
      m3PerPack * packagesVal;
  }
  // ==========================================
  // JAUNAIS IERAKSTS
  // ==========================================
  const entry = {
    area: areaVal,
    packages: packagesVal,
    thickness: thicknessVal,
    width: widthVal,
    length: rawLength,
    month: monthVal,
    year: yearVal,
    packWidth: packWidth,
    packLength: packLength,
    packHeight: packHeight,
    pieces: piecesPerPack,
    avgLength: avgLength,
    name:
      document.getElementById("name").value,
    code:
      document.getElementById("productCode").value,
    grade:
      document.getElementById("grade").value,
    comment:
      document.getElementById("comment").value,
    m3Pack: m3PerPack,
    total: totalM3
  };
  // ==========================================
  // LABOŠANA / JAUNS IERAKSTS
  // ==========================================
  if (editIndex !== null) {
    data[editIndex] = entry;
    dataChanged = true;
    editIndex = null;
    document.getElementById("addBtn").innerText =
      "➕ Pievienot";
    document.getElementById("cancelEditBtn").style.display =
      "none";
    showNotice(
      "✅ Labojums saglabāts",
      "success"
    );
  } else {
    data.push(entry);
    dataChanged = true;
    showNotice(
      "✅ Ieraksts pievienots",
      "success"
    );
  }
  // ==========================================
  // SAGLABĀŠANA
  // ==========================================
  localStorage.setItem(
    "data",
    JSON.stringify(data)
  );
  saveBackup();
  // ==========================================
  // FORMAS ATTĪRĪŠANA
  // ==========================================
  clearError();
  render();
  clearForm();
  document.getElementById("galiInputs").style.display =
    "none";
}
// ✅ Atcelt
function cancelEdit() {
  editIndex = null;
  document.getElementById("addBtn").innerText =
    "➕ Pievienot";
  document.getElementById("cancelEditBtn").style.display =
    "none";
  clearForm();
  clearError();
  showNotice(
      "ℹ️ Labošana atcelta",
      "info"
      );
}

// ✅ TABULA
function render() {
  let html = `
    <tr>
      <th>Apgabals</th>
      <th>Pakas</th>
      <th>Izmērs</th>
      <th>Gabali</th>
      <th>m3</th>
      <th>Darbības</th>
    </tr>`;
  
  let totalPackages = 0;
  let totalM3 = 0;
  
[...data]
.map((e, i) => ({ e, i }))
.reverse()
.forEach(({ e, i }) => {

    totalPackages += e.packages || 0;
    totalM3 += e.total || 0;
  let size;
  if ((e.length || "").trim().toLowerCase() === "gali") {
    size = `${e.packWidth}×${e.packLength}×${e.packHeight}`;
  } else {
    size = `${e.thickness}×${e.width}×${e.length}`;
  }

  html += `
  <tr>
    <td>${e.area}</td>
    <td>${e.packages}</td>
    <td>${size}</td>
    <td>${e.pieces || ""}</td>
    <td>${e.total?.toFixed(4) || ""}</td>
    <td>
      <button onclick="edit(${i})">✏️</button>
      <button onclick="remove(${i})">🗑️</button>
    </td>
  </tr>`;
});

// ✅ KOPSUMMA (vienreiz!)
html += `
<tr style="font-weight:bold; background:#eee;">
  <td>Kopā:</td>
  <td>${totalPackages}</td>
  <td></td>
  <td></td>
  <td>${totalM3.toFixed(4)}</td>
</tr>`;  
  document.getElementById("table").innerHTML = html;
}

// ✅ DELETE
function remove(i) {
  data.splice(i, 1);
  dataChanged = true;
  localStorage.setItem("data", JSON.stringify(data));
  render();
}


// ✅ EDIT

function edit(i) {

  const e = data[i];
  /*updateGradeColor();*/
  
  // ✅ atceramies kuru ierakstu labo
  editIndex = i;

    document.getElementById("area").value = e.area;
    document.getElementById("packages").value = e.packages;
    document.getElementById("thickness").value = e.thickness;
    document.getElementById("width").value = e.width;
    document.getElementById("length").value = e.length;
    document.getElementById("month").value = e.month;
    document.getElementById("year").value = e.year;
    document.getElementById("pieces").value = e.pieces;
    document.getElementById("name").value = e.name;
    document.getElementById("productCode").value = e.code;
    document.getElementById("grade").value = e.grade;
  const selectedItem =
    document.querySelector(
      `.item[data-value="${e.grade}"]`
      );
  if (selectedItem) {
    document.getElementById("gradeBtn").innerHTML =
      selectedItem.innerHTML + " ▼";
    }
    document.getElementById("comment").value = e.comment;

  if ((e.length || "").toLowerCase() === "gali") {
    isGaliMode = true;
      document.getElementById("length").disabled = true;
      document.getElementById("galiBtn").classList.add("active");
      document.getElementById("galiInputs").style.display = "block";

      document.getElementById("packWidth").value = e.packWidth;
      document.getElementById("packLength").value = e.packLength;
      document.getElementById("packHeight").value = e.packHeight;
      document.getElementById("avgLength").value = e.avgLength || "";
    } else {
    isGaliMode = false;
      document.getElementById("length").disabled = false;
      document.getElementById("galiBtn").classList.remove("active");
      document.getElementById("galiInputs").style.display = "none";
  }

  // ✅ poga pāriet labošanas režīmā 
document.getElementById("addBtn").innerText =
  "💾 Saglabāt labojumu";
  
document.getElementById("cancelEditBtn").style.display =
  "inline-block";
}

// 🎤 BALSS TESTS

function startVoiceRecognition() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showNotice("❌ Šī pārlūkprogramma neatbalsta balss ievadi.", "error");
        return;
    }
    const recognition = new SpeechRecognition();
        recognition.lang = "lv-LV";
        recognition.continuous = false;
        recognition.interimResults = false;
    // Ļoti svarīgi - iegūstam līdz 5 variantus
        recognition.maxAlternatives = 5;
    const voiceResult = document.getElementById("voiceResult");
    if (!voiceResult) {
        console.error("Nav atrasts #voiceResult");
        return;
    }
        voiceResult.classList.remove("hidden");
        voiceResult.innerHTML = "🎤 Klausos...";
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function normalizeText(text) {
        return String(text)
            .toLowerCase()
            .trim()
            // dažādi x varianti
            .replace(/[×✕✖]/g, "x")
            // komatus un punktus pārvēršam par atstarpi
            .replace(/[.,!?;:]/g, " ")
            // vairākas atstarpes -> viena
            .replace(/\s+/g, " ");
    }
    const units = {
        "nulle": 0,
        "viens": 1,
        "viena": 1,
        "vienu": 1,
        "divi": 2,
        "divas": 2,
        "divu": 2,
        "trīs": 3,
        "tris": 3,
        "četri": 4,
        "četras": 4,
        "četri": 4,
        "cetri": 4,
        "cetras": 4,
        "pieci": 5,
        "piecas": 5,
        "seši": 6,
        "sešas": 6,
        "sesi": 6,
        "sesas": 6,
        "septiņi": 7,
        "septiņas": 7,
        "septini": 7,
        "septinas": 7,
        "astoņi": 8,
        "astoņas": 8,
        "astoni": 8,
        "astonas": 8,
        "deviņi": 9,
        "deviņas": 9,
        "devini": 9,
        "devinas": 9
    };
    const tens = {
        "desmit": 10,
        "vienpadsmit": 11,
        "divpadsmit": 12,
        "trīspadsmit": 13,
        "trispadsmit": 13,
        "četrpadsmit": 14,
        "cetrpadsmit": 14,
        "piecpadsmit": 15,
        "sešpadsmit": 16,
        "sespadsmit": 16,
        "septiņpadsmit": 17,
        "septinpadsmit": 17,
        "astoņpadsmit": 18,
        "astonpadsmit": 18,
        "deviņpadsmit": 19,
        "devinpadsmit": 19,
        "divdesmit": 20,
        "trīsdesmit": 30,
        "trisdesmit": 30,
        "četrdesmit": 40,
        "cetrdesmit": 40,
        "piecdesmit": 50,
        "sešdesmit": 60,
        "sesdesmit": 60,
        "septiņdesmit": 70,
        "septindesmit": 70,
        "astoņdesmit": 80,
        "astondesmit": 80,
        "deviņdesmit": 90,
        "devindesmit": 90
    };
    const multipliers = {
        "simts": 100,
        "simtu": 100,
        "tūkstotis": 1000,
        "tūkstoši": 1000,
        "tūkstoša": 1000,
        "tūkstoti": 1000,
        "tukstotis": 1000,
        "tukstosi": 1000,
        "tukstosa": 1000,
        "miljons": 1000000,
        "miljoni": 1000000,
        "miljonu": 1000000
    };
    const ordinalMonths = {
        "pirmais": 1,
        "pirma": 1,
        "pirmo": 1,
        "otrais": 2,
        "otra": 2,
        "otro": 2,
        "trešais": 3,
        "tresais": 3,
        "trešā": 3,
        "tresa": 3,
        "ceturtais": 4,
        "ceturta": 4,
        "piektais": 5,
        "piektā": 5,
        "piektas": 5,
        "piekto": 5,
        "sestais": 6,
        "sestā": 6,
        "sesto": 6,
        "septītais": 7,
        "septita": 7,
        "septītā": 7,
        "septito": 7,
        "astotais": 8,
        "astota": 8,
        "astotā": 8,
        "astoto": 8,
        "devītais": 9,
        "devitais": 9,
        "devītā": 9,
        "devita": 9,
        "desmitais": 10,
        "desmitā": 10,
        "desmito": 10,
        "vienpadsmitais": 11,
        "vienpadsmitā": 11,
        "divpadsmitais": 12,
        "divpadsmitā": 12
    };
    function parseLatvianNumberWords(text) {
        text = normalizeText(text);
        if (!text) {
            return null;
        }
        // Ja jau ir tīrs cipars
        if (/^\d+$/.test(text)) {
            return Number(text);
        }
        const words = text.split(/\s+/);
            let total = 0;
            let current = 0;
            let foundNumber = false;
                for (const word of words) {
            if (units[word] !== undefined) {
                current += units[word];
                foundNumber = true;
            }
            else if (tens[word] !== undefined) {
                current += tens[word];
                foundNumber = true;
            }
            else if (word === "simts" || word === "simtu") {
                if (current === 0) {
                    current = 100;
                } else {
                    current *= 100;
                }
                foundNumber = true;
            }
            else if (
                word === "tūkstotis" ||
                word === "tūkstoši" ||
                word === "tūkstoša" ||
                word === "tūkstoti" ||
                word === "tukstotis" ||
                word === "tukstosi" ||
                word === "tukstosa"
            ) {
                if (current === 0) {
                    current = 1;
                }
                total += current * 1000;
                current = 0;
                foundNumber = true;
            }
            else if (
                word === "miljons" ||
                word === "miljoni" ||
                word === "miljonu"
            ) {
                if (current === 0) {
                    current = 1;
                }
                total += current * 1000000;
                current = 0;
                foundNumber = true;
            }
            else if (word === "un") {
                // neko nedarām
            }
            else if (/^\d+$/.test(word)) {
                current += Number(word);
                foundNumber = true;
            }
        }
        total += current;
        return foundNumber
            ? total
            : null;
    }
    const digitWords = {
        "nulle": "0",
        "viens": "1",
        "viena": "1",
        "divi": "2",
        "divas": "2",
        "trīs": "3",
        "tris": "3",
        "četri": "4",
        "četras": "4",
        "cetri": "4",
        "cetras": "4",
        "pieci": "5",
        "piecas": "5",
        "seši": "6",
        "sešas": "6",
        "sesi": "6",
        "sesas": "6",
        "septiņi": "7",
        "septiņas": "7",
        "septini": "7",
        "septinas": "7",
        "astoņi": "8",
        "astoņas": "8",
        "astoni": "8",
        "astonas": "8",
        "deviņi": "9",
        "deviņas": "9",
        "devini": "9",
        "devinas": "9"
    };
    function parseDigitSequence(text) {
        const words =
            normalizeText(text).split(/\s+/);
        let result = "";
        let found = false;
        for (const word of words) {
            if (/^\d+$/.test(word)) {
                result += word;
                found = true;
            }
            else if (
                digitWords[word] !== undefined
            ) {
                result += digitWords[word];
                found = true;
            }
        }
        if (!found || !result) {
            return null;
        }
        return Number(result);
    }
    function parseNumber(text) {
        if (!text) {
            return null;
        }
        text = normalizeText(text);
        // Vispirms mēģinām atrast ciparu
        const digitMatch =
            text.match(/\b\d+\b/);
        if (digitMatch) {
            const value = Number(digitMatch[0]);
            if (Number.isFinite(value)) {
                return value;
            }
        }
        // Tad vārdisko skaitli
        const wordValue = parseLatvianNumberWords(text);
        if (wordValue !== null) {
            return wordValue;
        }
        // Un beigās ciparu virkni
        return parseDigitSequence(text);
    }
    function chooseCandidate(values) {
        if (!values || values.length === 0) {
            return null;
        }
        const cleanValues =
            values.filter(v =>
                v !== null &&
                v !== undefined &&
                Number.isFinite(v)
            );
        if (!cleanValues.length) {
            return null;
        }
        const counts = new Map();
        for (const value of cleanValues) {
            counts.set(
                value,
                (counts.get(value) || 0) + 1
            );
        }
        let candidates =
            Array.from(counts.entries())
                .map(([value, count]) => ({
                    value: Number(value),
                    count: count
                }));
        candidates.sort((a, b) => {
            // 1. Vispirms biežākais variants
            if (b.count !== a.count) {
                return b.count - a.count;
            }
            // 2. Ja vienāds biežums,
            // priekšroka lielākam ciparu skaitam
            const aDigits = String(Math.abs(a.value)).length;
            const bDigits = String(Math.abs(b.value)).length;
            if (bDigits !== aDigits) {
                return bDigits - aDigits;
            }
            // 3. Ja viss vienādi,
            // saglabājam pirmo sastapto
            return 0;
        });
        return candidates[0].value;
    }
    function parseDimensionsFromText(text) {
        text = normalizeText(text);
        let match = text.match(
            /(\d+)\s*(?:\*|x|reiz|reizes)\s*(\d+)\s*(?:\*|x|reiz|reizes)\s*(\d+)/
        );
        if (match) {
            return [
                Number(match[1]),
                Number(match[2]),
                Number(match[3])
            ];
        }
        match = text.match(
            /(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/
        );
        if (match) {
            return [
                Number(match[1]),
                Number(match[2]),
                Number(match[3])
            ];
        }
        const parts =
            text.split(/\s+(?:reiz|reizes)\s+/);
        if (parts.length === 3) {
            const a = parseNumber(parts[0]);
            const b = parseNumber(parts[1]);
            const c = parseNumber(parts[2]);
            if (
                a !== null &&
                b !== null &&
                c !== null
            ) {
                return [a, b, c];
            }
        }
        return null;
    }
    function findBestDimensions(candidates) {
        const dimensionCandidates = [];
        for (const candidate of candidates) {
            const dimensions = parseDimensionsFromText(candidate.text);
            if (dimensions) {
                dimensionCandidates.push({
                    dimensions: dimensions,
                    text: candidate.text
                });
            }
        }
        if (!dimensionCandidates.length) {
            return null;
        }
        // Katru dimensiju analizējam atsevišķi
        const thicknessValues = [];
        const widthValues = [];
        const lengthValues = [];
        for (const item of dimensionCandidates) {
            thicknessValues.push(
                item.dimensions[0]
            );
            widthValues.push(
                item.dimensions[1]
            );
            lengthValues.push(
                item.dimensions[2]
            );
        }
        return {
            thickness:
                chooseCandidate(thicknessValues),
            width:
                chooseCandidate(widthValues),
            length:
                chooseCandidate(lengthValues),
            variants:
                dimensionCandidates
        };
    }
    function parsePackagesFromText(text) {
        text = normalizeText(text);
        // 5 pakas
        let match = text.match(
                /(\d+)\s+(?:paka|pakas|pakām|pakam|bankas|banku)\b/
            );
        if (match) {
            return Number(match[1]);
        }
        // piecas pakas
        match = text.match(
                /(.+?)\s+(?:paka|pakas|pakām|pakam|bankas|banku)\b/
            );
        if (match) {
            const value =
                parseNumber(match[1]);
            if (value !== null) {
                return value;
            }
        }
        return null;
    }
    function parsePiecesFromText(text) {
        text = normalizeText(text);
        let match =
            text.match(
                /(\d+)\s+(?:gabali|gabals|gab\.?)\b/
            );
        if (match) {
            return Number(match[1]);
        }
        match =
            text.match(
                /(.+?)\s+(?:gabali|gabals|gab\.?)\b/
            );
        if (match) {
            const candidate = match[1].trim();
            const value = parseNumber(candidate);
            if (value !== null) {
                return value;
            }
        }
        return null;
    }
    function parseMonthFromText(text) {
        text = normalizeText(text);
        const months = {
            "janvāris": 1,
            "janvaris": 1,
            "janvārī": 1,
            "janvari": 1,
            "februāris": 2,
            "februaris": 2,
            "februārī": 2,
            "februari": 2,
            "marts": 3,
            "martā": 3,
            "marta": 3,
            "aprīlis": 4,
            "aprilis": 4,
            "aprīlī": 4,
            "aprili": 4,
            "maijs": 5,
            "maijā": 5,
            "maija": 5,
            "jūnijs": 6,
            "junijs": 6,
            "jūnijā": 6,
            "junija": 6,
            "jūlijs": 7,
            "julijs": 7,
            "jūlijā": 7,
            "julija": 7,
            "augusts": 8,
            "augustā": 8,
            "augusta": 8,
            "septembris": 9,
            "septembrī": 9,
            "septembri": 9,
            "oktobris": 10,
            "oktobrī": 10,
            "oktobri": 10,
            "novembris": 11,
            "novembrī": 11,
            "novembri": 11,
            "decembris": 12,
            "decembrī": 12,
            "decembri": 12
        };
        // "piektais mēnesis"
        const ordinalMatch = text.match(
                /([^\s]+)\s+(?:mēnesis|menesis|mēnesī|menesi)/
            );
        if (ordinalMatch) {
            const word = ordinalMatch[1];
            if (
                ordinalMonths[word] !== undefined
            ) {
                return ordinalMonths[word];
            }
            const number = parseNumber(word);
            if (
                number !== null &&
                number >= 1 &&
                number <= 12
            ) {
                return number;
            }
        }
        // "5 mēnesis"
        const numericMatch = text.match(
                /(\d+)\s+(?:mēnesis|menesis|mēnesī|menesi)/
            );
        if (numericMatch) {
            const value = Number(numericMatch[1]);
            if (
                value >= 1 &&
                value <= 12
            ) {
                return value;
            }
        }
        // Mēneša nosaukums
        for (const [word, value] of Object.entries(months)) {
            if (text.includes(word)) {
                return value;
            }
        }
        return null;
    }
    function parseYearFromText(text) {
        text = normalizeText(text);
        let match = text.match(
                /(\d{2})\s+(?:gads|gadā|gada)/
            );
        if (match) {
            const value = Number(match[1]);
            if (
                value >= 20 &&
                value <= 99
            ) {
                return value;
            }
        }
        // Vārdiskais variants:
        // "divdesmit seši gads"
        match =
            text.match(
                /(.+?)\s+(?:gads|gadā|gada)/
            );
        if (match) {
            const value = parseNumber(match[1]);
            if (
                value !== null &&
                value >= 20 &&
                value <= 99
            ) {
                return value;
            }
        }
        return null;
    }
    function findBestValue(candidates, parser) {
        const values = [];
        for (const candidate of candidates) {
            const value = parser(candidate.text);
            if (value !== null) {
                values.push(value);
            }
        }
        return chooseCandidate(values);
    }
    function hasAddCommand(text) {
        return /\b(?:pievienot|pievieno|pievienoj)\b/i
            .test(text);
    }
    try {
        recognition.start();
    } catch (error) {
        console.error(
            "SpeechRecognition start error:",
            error
        );
        voiceResult.innerHTML =
            "❌ Neizdevās palaist balss atpazīšanu.";
        return;
    }
    recognition.onresult = function(event) {
        const result = event.results[0];
        const candidates = [];
        for (let i = 0; i < result.length; i++) {
            candidates.push({
                text:
                    normalizeText(
                        result[i].transcript
                    ),
                confidence:
                    result[i].confidence || 0,
                index: i
            });
        }
        // Ja kaut kādu iemeslu dēļ nav kandidātu
        if (!candidates.length) {
            voiceResult.innerHTML =
                "❌ Neizdevās iegūt runas tekstu.";
            return;
        }
        const mainText = candidates[0].text;
        const packages = findBestValue(
                candidates,
                parsePackagesFromText
            );
        if (packages !== null) {
            const field = document.getElementById("packages");
            if (field) {
                field.value = packages;
            }
        }
        const pieces = findBestValue(
                candidates,
                parsePiecesFromText
            );
        if (pieces !== null) {
            const field = document.getElementById("pieces");
            if (field) {
                field.value = pieces;
            }
        }
        const dimensions = findBestDimensions(candidates);
        if (dimensions) {
            const thickness = document.getElementById("thickness");
            const width = document.getElementById("width");
            const length = document.getElementById("length");
            if (thickness) {
                thickness.value = dimensions.thickness;
            }
            if (width) {
                width.value = dimensions.width;
            }
            if (length) {
                length.value = dimensions.length;
            }
        }
        const month = findBestValue(
                candidates,
                parseMonthFromText
            );
        if (month !== null) {
            const field = document.getElementById("month");
            if (field) {
                field.value = month;
            }
        }
        const year = findBestValue(
                candidates,
                parseYearFromText
            );
        if (year !== null) {
            const field =
                document.getElementById("year");
            if (field) {
                field.value = year;
            }
        }
        let debugHtml = "";
        for (let i = 0; i < candidates.length; i++) {
            debugHtml += `
                <div>
                    Variant ${i + 1}:
                    ${escapeHtml(candidates[i].text)}
                    (${candidates[i].confidence.toFixed(2)})
                </div>
            `;
        }
        voiceResult.innerHTML = `
            🎤 Dzirdēju:
            <strong>${escapeHtml(mainText)}</strong>
            <br>
            ⭐ Tiek analizēti visi
            ${candidates.length}
            varianti.
            <hr>
            📦 Pakas:
            <strong>
                ${packages !== null ? packages : "—"}
            </strong>
            <br>
            🧩 Gabali:
            <strong>
                ${pieces !== null ? pieces : "—"}
            </strong>
            <br>
            📐 Dimensijas:
            <strong>
                ${
                    dimensions
                        ? dimensions.thickness +
                          " × " +
                          dimensions.width +
                          " × " +
                          dimensions.length
                        : "—"
                }
            </strong>
            <br>
            📅 Mēnesis:
            <strong>
                ${month !== null ? month : "—"}
            </strong>
            <br>
            📅 Gads:
            <strong>
                ${year !== null ? year : "—"}
            </strong>
            <hr>
            <strong>SpeechRecognition varianti:</strong>
            ${debugHtml}
        `;
        // Pārbaudām VISUS variantus, ne tikai pirmo.
        let addCommand = false;
        for (const candidate of candidates) {
            if (hasAddCommand(candidate.text)) {
                addCommand = true;
                break;
            }
        }
        if (addCommand) {
            voiceResult.innerHTML += `<br><br>✅ Komanda "pievienot" atpazīta`;
            setTimeout(function() {
                if (typeof add === "function") {
                    add();
                } else {
                    console.error(
                        "Funkcija add() nav atrasta."
                    );
                    voiceResult.innerHTML += `<br>❌ Funkcija add() nav atrasta.`;
                }
            }, 500);
        }
    };
    recognition.onerror = function(event) {
        console.error(
            "SpeechRecognition error:",
            event.error
        );
        let message =
            "❌ Balss atpazīšanas kļūda.";
        switch (event.error) {
            case "not-allowed":
                message =
                    "❌ Mikrofonam nav dota atļauja.";
                break;
            case "no-speech":
                message =
                    "❌ Netika uztverta runa.";
                break;
            case "audio-capture":
                message =
                    "❌ Neizdevās piekļūt mikrofonam.";
                break;
            case "network":
                message =
                    "❌ Tīkla kļūda balss atpazīšanas laikā.";
                break;
            case "aborted":
                message =
                    "⚠️ Balss atpazīšana tika pārtraukta.";
                break;
        }
        voiceResult.innerHTML =
            `${message}<br>Kļūda: ${escapeHtml(event.error)}`;
    };
    recognition.onend = function() {

        console.log(
            "🎤 Balss ieraksts pabeigts"
        );
    };
}
window.onload = () => {
  const location = localStorage.getItem("location");
  const name = localStorage.getItem("userName");
  const savedData = localStorage.getItem("data");
  const backupRaw = localStorage.getItem("backupData");
  
  if (backupRaw) {
    const backup =
      JSON.parse(backupRaw);
    const age = Date.now() -
      new Date(backup.timestamp).getTime();
    const sevenDays =
      7 * 24 * 60 * 60 * 1000;
    if (age > sevenDays) {
      localStorage.removeItem(
        "backupData"
        );
    } else {
      document.getElementById("restoreInfo")
        .innerHTML = `
          Ražotne: ${backup.location}<br>
          Lietotājs: ${backup.user}<br><br>
          📊 Inventarizācija<br>
          Ieraksti: ${backup.summary.entries}<br>
          Paletes: ${backup.summary.packages}<br>
          m³: ${backup.summary.totalM3.toFixed(4)}<br><br>
          Datums:<br>
          ${new Date(
            backup.timestamp
            ).toLocaleString()}
        `;
    document.getElementById(
      "restoreModal"
      ).style.display = "block";
    }
}
  // ✅ KOMENTĀRU IZVĒLNE

      document.getElementById("thickness")
        .addEventListener("input", showSizeSuggestions);
      document.getElementById("width")
        .addEventListener("focus", () => {
  const container =
      document.getElementById("sizeSuggestions");
        container.innerHTML = "";
        container.style.display = "none";
      });
      document.getElementById("commentPreset")
        .addEventListener("change", 
    function() {
      if (this.value === "Cits") {
        document.getElementById("comment").focus();
      } else {
        document.getElementById("comment").value =
      this.value;
      }
    });
  const savedLibrary = localStorage.getItem("dimensionsLibrary");

//  ✅ DIMENSIJU BIB IELĀDE
  if (savedLibrary) {
    dimensionsLibrary =
    JSON.parse(savedLibrary);
  }  
//  ✅ MĒNESIS - GADS
  document.getElementById("month")
    .addEventListener("input", updateYearFromMonth);
  document.getElementById("month")
    .addEventListener("change", updateYearFromMonth);;
// ✅ IZVĒLNE

const gradeBtn = document.getElementById("gradeBtn");
const menu = document.querySelector(".menu");
const gradeInput = document.getElementById("grade");

  gradeBtn.addEventListener("click", () => {
    menu.style.display =
    menu.style.display === "block"
    ? "none"
    : "block";
    });
  document.querySelectorAll(".menu .item")
    .forEach(item => {
      item.addEventListener("click", () => {
        gradeInput.value =
      item.dataset.value;
        gradeBtn.innerHTML =
      item.innerHTML + " ▼";
        menu.style.display = "none";
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown")) {
    menu.style.display = "none";
  }
});
  //✅ LOGIN CHECK
  if (location && name) {
    currentLocation = location;
    document.getElementById("locationSelect").style.display = "none";
    document.getElementById("appContent").style.display = "block";
    setHeaderInfo();    
    updateAreas();
    updateMaps();
    checkBetaAccess();
  }
    
  // LOAD DATA
  if (savedData) {
    try {
      data = JSON.parse(savedData);
      render();
    } catch (e) {
      console.warn("Neizdevās ielādēt datus", e);
    }
  }
    // ✅ Ja gads tukšs, ieliek aktuālo
  if (!document.getElementById("year").value) {
        document.getElementById("year").value =
      new Date().getFullYear();
    }
  // ✅ LIVE APRĒĶINS
    document.getElementById("avgLength").addEventListener("input", calculateGali);
    document.getElementById("packWidth").addEventListener("input", calculateGali);
    document.getElementById("packLength").addEventListener("input", calculateGali);
    document.getElementById("packHeight").addEventListener("input", calculateGali);
    document.getElementById("thickness").addEventListener("input", calculateGali);
    document.getElementById("width").addEventListener("input", calculateGali);
   
        const areaSelect = document.getElementById("area");
            if (areaSelect) {
                areaSelect.removeEventListener("change",
                    handleAreaChange
                );
                areaSelect.addEventListener("change",
                    handleAreaChange
                );
            }
        const voiceBtn = document.getElementById("voiceBtn");
            if (voiceBtn) {
                voiceBtn.addEventListener(
                    "click",
                    startVoiceRecognition
                );
            }
    };

// ✅ ERROR
function error(msg, fieldId = null) {
  document.getElementById("error").innerText = msg;
    showNotice(
      "⚠️ " + msg,
        "error",
    fieldId
  );
}
  
function checkBetaAccess() {
  const user =
    (localStorage.getItem("userName") || "")
      .trim()
      .toLowerCase();
  const isBetaUser =
    betaUsers.includes(user);
      [
        "betaFeatures",
        "voiceBtn",
        "betaImportView",
        "betaAnalytics"
      ].forEach(id => {
  const el =
    document.getElementById(id);
  if (el) {
    el.style.display =
    isBetaUser ? "block" : "none";
    }
  });
}

function isBetaUser() {
  return betaUsers.includes(
    (localStorage.getItem("userName") || "")
      .trim()
      .toLowerCase()
    );
}
// ======================================================
// 📷 FOTO PALĪGFUNKCIJAS
// ======================================================
function hasAreaPhoto(area) {
    return !!(
        area &&
        areaPhotos &&
        areaPhotos[area]
    );
}
// ------------------------------------------------------
// Saglabā foto localStorage
// ------------------------------------------------------
function saveAreaPhotosStorage() {
    try {
        localStorage.setItem(
            "areaPhotos",
            JSON.stringify(areaPhotos)
        );
        return true;
    } catch (error) {
        console.error(
            "❌ Neizdevās saglabāt foto:",
            error);
        if (
            error &&
            error.name === "QuotaExceededError") {
            showNotice(
                "❌ Nepietiek vietas pārlūka krātuvē. " +
                "Foto ir pārāk liels vai foto ir par daudz.",
                "error"
            );
        } else {
            showNotice(
                "❌ Neizdevās saglabāt foto.",
                "error");
        }
        return false;
    }
}
// ------------------------------------------------------
// Atver foto izvēli konkrētam apgabalam
// ------------------------------------------------------
function chooseAreaPhoto(area) {
    if (!area) {
        showNotice(
            "⚠️ Nav izvēlēts apgabals!",
            "error");
        return;
    }
    const input =
        document.getElementById("areaPhotoInput");
    if (!input) {
        showNotice(
            "❌ Foto ievades lauks nav atrasts!",
            "error");
        console.error(
            "❌ Nav #areaPhotoInput");
        return;
    }
    photoTargetArea = area;
    currentArea = area;
    // Notīra iepriekšējo izvēli,
    // lai var izvēlēties to pašu foto vēlreiz
    input.value = "";
    input.click();
}
// ------------------------------------------------------
// Dzēš apgabala foto
// ------------------------------------------------------
function deleteAreaPhoto(area) {
    if (!area) {
        return;
    }
    if (!hasAreaPhoto(area)) {
        showNotice(
            `ℹ️ Apgabalam ${area} nav foto.`,
            "info");
        return;
    }
    const confirmed = confirm(
        `Vai tiešām dzēst apgabala ${area} foto?`
        );
    if (!confirmed) {
        return;
    }
    delete areaPhotos[area];
    if (!saveAreaPhotosStorage()) {
        return;
    }
    dataChanged = true;
    saveBackup();
    renderAreaPhotoPanel(area);
    // Ja ir importēšanas logs
    if (
        typeof renderImportAreas === "function" &&
        importedBackup &&
        importedAreaSummary
    ) {
        renderImportAreas();
    }
    showNotice(
        `🗑️ Foto dzēsts apgabalam ${area}`,
        "success"
    );
}
// ------------------------------------------------------
// Atver foto apskatei
// ------------------------------------------------------
function viewAreaPhoto(area) {
    if (!area) {
        return;
    }
    const photo =
        areaPhotos[area];
    if (!photo) {
        showNotice(
            `ℹ️ Apgabalam ${area} nav foto.`,
            "info");
        return;
    }
    openImageFromSrc(photo);
}
// ------------------------------------------------------
// Atver importētā backup foto
// ------------------------------------------------------
function viewImportedAreaPhoto(area) {
    if (
        !importedBackup ||
        !importedBackup.areaPhotos) {
        return;
    }
    const photo =
        importedBackup.areaPhotos[area];
    if (!photo) {
        showNotice(
            `ℹ️ Apgabalam ${area} nav foto.`,
            "info");
        return;
        }    
    openImageFromSrc(photo);
}

function clearError() {
  document.getElementById("error").innerText = "";
}

function clearForm() {
  document.getElementById("packages").value = "";
  document.getElementById("thickness").value = "";
  document.getElementById("width").value = "";
  document.getElementById("length").value = "";
  document.getElementById("month").value = "";
  document.getElementById("name").value = "";
  document.getElementById("productCode").value = "";
  document.getElementById("comment").value = "";
  document.getElementById("commentPreset").value = "";
  document.getElementById("pieces").value = "";
  document.getElementById("packWidth").value = "";
  document.getElementById("packLength").value = "";
  document.getElementById("packHeight").value = "";
  document.getElementById("avgLength").value = "";
  document.getElementById("galiInputs").style.display = "none";
  document.getElementById("sizeSuggestions").innerHTML = "";
  document.getElementById("sizeSuggestions").style.display = "none";
const calcInfo = document.getElementById("calcInfo");
if (calcInfo) {
    calcInfo.style.display = "none";
  }
  isGaliMode = false;
    document.getElementById("length").disabled = false;
    document.getElementById("galiBtn").classList.remove("active");
  setTimeout(() => {
    const field =
      document.getElementById("packages");
    const y =
      field.getBoundingClientRect().top +
        window.scrollY - 80;
        window.scrollTo({
          top: y,
          behavior: "smooth"
          });
    setTimeout(() => {
      field.focus();
      }, 300);
    }, 1200);
  }

// ✅ TABULAS SLĒPŠANA
  let tableVisible = true;
function toggleTable() {
  const t = document.getElementById("table");
    tableVisible = !tableVisible;
    t.style.display = tableVisible ? "table" : "none";
  }

function calculateGali() {
  console.log("GALI CALC");
  const thicknessVal = Number(document.getElementById("thickness").value);
  const widthVal = Number(document.getElementById("width").value);
  const packWidth = Number(document.getElementById("packWidth").value);
  const packLength = Number(document.getElementById("packLength").value);
  const packHeight = Number(document.getElementById("packHeight").value);
  const avgLength = Number(document.getElementById("avgLength").value);
if (
    thicknessVal <= 0 || widthVal <= 0 ||
    packWidth <= 0 || packLength <= 0 || packHeight <= 0 ||
    avgLength <= 0
) return;
  let piecesAcrossWidth = Math.floor(packWidth / widthVal);
  let piecesAcrossHeight = Math.floor(packHeight / thicknessVal);
  let piecesFront = piecesAcrossWidth * piecesAcrossHeight;
  let columns = Math.floor(packLength / avgLength);
  // ✅ MAINĪJUMS ŠEIT
  let efficiency = 0.95;
  let piecesPerPack = Math.max( 1, Math.floor(
    piecesFront * columns * efficiency
  )
);

  // ✅ PARĀDA AR ≈
  document.getElementById("pieces").value =
    "≈ " + piecesPerPack;
  document.getElementById("calcInfo").style.display = "block";
}

 //✅ Border
function borderAll() {
  return {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" }
  };
}

//✅ Color
function fillGray() {
  return {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9D9D9" }
  };
}

//✅ Row style

function applyRowStyle(row, type) {
  let color;
  switch (type) {
    case "lightGreen":
      color = "FFC6EFCE";
      break;
    case "yellow":
      color = "FFFFEB9C";
      break;
    case "softGreen":
      color = "FFE2EFDA";
      break;
    case "blue":
      color = "FFBDD7EE";
      break;
    case "beige":
      color = "FFFCE4D6";
      break;
    default:
      color = "FFFFFFFF";
  }

  // ✅ palielina rindas augstumu (vizuāls "padding")
  row.height = 22;
  row.eachCell((cell, colNumber) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: color }
    };
    cell.border = borderAll();

    // ✅ centrē tekstu visur
    cell.alignment = {
      vertical: "middle",
      horizontal: colNumber === 2 ? "left" : "center",
      wrapText: true,
      indent: colNumber === 2 ? 1 : 0
    };
  });
}

  //✅ Export Excel

async function exportExcel() {

  if (data.length === 0) {
    return showNotice(
      "⚠️ Nav datu eksportam",
      "error"
    );
  }

  const location = localStorage.getItem("location") || "";
  const name = localStorage.getItem("userName") || "";

  const d = new Date();
  const safeLocation = safeFileName(location);
  const safeName = safeFileName(name);
  const dateStr =
    String(d.getDate()).padStart(2, "0") + "." +
    String(d.getMonth() + 1).padStart(2, "0") + "." +
    d.getFullYear();
  
  const fileDate =
    String(d.getDate()).padStart(2, "0") + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    d.getFullYear();

  const timeStr =
  String(d.getHours()).padStart(2, "0") +
  String(d.getMinutes()).padStart(2, "0") +
  String(d.getSeconds()).padStart(2, "0");

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Inventarizācija");

 //✅ TITLE
  ws.mergeCells("A1:O1");
  ws.getCell("A1").value = "Nepabeigtas Ražošanas Inventarizācijas protokols";
  ws.getCell("A1").alignment = { horizontal: "center" };
  ws.getCell("A1").font = { bold: true, size: 14 };
  ws.addRow([]);

//✅ SKAIDROJUMU BLOKS

function addLegendRow(values, color) {
  let row = ws.addRow(values);
    applyRowStyle(row, color);
  let r = row.number;

  // ✅ merge Skaidrojums (B → L)
  ws.mergeCells(`B${r}:L${r}`);

  // ✅ skaists alignment
  ws.getCell(`B${r}`).alignment = {
    vertical: "middle",
    horizontal: "left",
    wrapText: true,
    indent: 1
  };
}

// ✅ HEADER
let legendHeader = ws.addRow([
  "Šķira", "Skaidrojums", "", "", "", "", "", "", "", "", "", "", "", "Apzīmējums"
]);

legendHeader.eachCell(cell => {
  cell.font = { bold: true };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.border = borderAll();
  cell.fill = fillGray();
});

// ✅ HEADER merge arī
let hr = legendHeader.number;
ws.mergeCells(`B${hr}:L${hr}`);

// ✅ ROWS
addLegendRow(
  ["K kods", "Sakomplektēta produkcija", "", "", "", "", "", "", "", "", "", "", "", "K"],
  "lightGreen"
);

addLegendRow(
  ["Augstākā šķira", "Pilnībā gatava detaļa, pabeigtas visas operācijas, t.sk., impregnācija", "", "", "", "", "", "", "", "", "", "", "", "A"],
  "yellow"
);

// ✅ 1. šķira
[
  ["1. šķira", "Ēvelēti dēļi", "1a"],
  ["", "Neēvelēti, bet sagarināti dēļi", "1b"],
  ["", "Ēvelētas sagarinātas sagataves", "1c"],
  ["", "Tālākā apstrādē esošas sagataves", "1d"]
].forEach(r => {
  addLegendRow(
    [r[0], r[1], "", "", "", "", "", "", "", "", "", "", "", r[2]],
    "softGreen"
  );
});
// ✅ 2. šķira
[
  ["2. šķira", "Sagataves, detaļas un gali, kurām pagaidām nav konkrēta pielietojuma", "2a"],
  ["", "Brāķis, kuram redzams pielietojums - varam izmantot tālākā apstrādē", "2b"],
  ["", "Brāķis, kuram nav pielietojums - iznīcināms", "2c"]
].forEach(r => {
  addLegendRow(
    [r[0], r[1], "", "", "", "", "", "", "", "", "", "", "", r[2]],
    "blue"
  );
});

// ✅ Paletes
addLegendRow(
  ["Paletes", "Paletes gatavai produkcijai", "", "", "", "", "", "", "", "", "", "", "", "PAL"],
  "beige"
);
ws.addRow([]);
ws.addRow([]);
  
  //✅ INFO

  ws.addRow([
    "Datums:", dateStr,
    "", "",
    "Sastādīja:", name,
    "", "",
    "Ražotne:", location
  ]);
  ws.addRow([]);
  
  //✅ TABULAS HEADER

  const headers = [
    "Apgabals",
    "Paku skaits",
    "Detaļas nosaukums",
    "Produkta kods",
    "m3 vienā pakā",
    "Biezums",
    "Platums",
    "Garums",
    "Detaļu skaits pakā",
    "m3 kopā",
    "Mēnesis",
    "Gads",
    "Šķira",
    "Komentārs",
    "",
    "m3 detaļas"
  ];

  const tableHeader = ws.addRow(headers);
  tableHeader.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
    cell.border = borderAll();
    cell.fill = fillGray();
  });
  const startRow = tableHeader.number + 1;

 //✅ DATA

  let totalPackages = 0;
    data.forEach(e => {
    totalPackages += e.packages || 0;
  let pieceM3 = 0;
  if ((e.length || "").toLowerCase() === "gali") {
      pieceM3 = (e.thickness * e.width * e.avgLength) / 1000000000;
  } else {
      pieceM3 = (e.thickness * e.width * Number(e.length)) / 1000000000;
    }
  const rowIndex = ws.rowCount + 1;
  const row = ws.addRow([
    // A — Apgabals
      e.area,
    // B — Paku skaits
      e.packages,
    // C — Detaļas nosaukums
      e.name,
    // D — Produkta kods
      e.code,
    // E — m3 vienā pakā
      {
    formula: `P${rowIndex}*I${rowIndex}`
    },
    // F — Biezums
      e.thickness,
    // G — Platums
      e.width,
    // H — Garums
      (e.length || "").toLowerCase() === "gali"
        ? e.avgLength || ""
        : Number(e.length),
    // I — Detaļu skaits pakā
      e.pieces,
    // J — m3 kopā
    // Paku skaits × m3 vienā pakā
      { formula: `B${rowIndex}*E${rowIndex}` },
    // K — Mēnesis
      String(e.month).padStart(2, "0"),
    // L — Gads
      e.year < 100 ? "20" + e.year : e.year,
    // M — Šķira
      e.grade,
    // N — Komentārs
      e.comment,
    // O — Gali
      (e.length || "").toLowerCase() === "gali" ? "Gali" : "",
    // P = m3 detaļas
      {
    formula: `F${rowIndex}*G${rowIndex}*H${rowIndex}/1000000000`
  }
    ]);
    // 🔢 3 cipari aiz komata
    row.getCell(5).numFmt = '0.000';   // E
    row.getCell(10).numFmt = '0.000';  // J
    row.eachCell(cell => {
      cell.border = borderAll();
    });
  });

  const lastRow = ws.rowCount;

  //✅ SUM
  ws.addRow([]);
  ws.addRow([
      "Pakas kopā:",
      { formula: `SUM(B${startRow}:B${lastRow})`, result: totalPackages }
    ]);
  const totalM3Row = ws.addRow([
  "m3 kopā:",
  { formula: `SUM(J${startRow}:J${lastRow})` }
    ]);

totalM3Row.getCell(2).numFmt = '0.000';

  //✅ COLUMN WIDTH

  [
    10, 12, 25, 20, 14,
    10, 10, 10,
    16, 10,
    10, 10,
    10, 25, 10, 12
  ].forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  //✅ SAVE

  const buf = await wb.xlsx.writeBuffer();
  saveAs(
  new Blob([buf]),
  `inv_${safeLocation}_${safeName}_${fileDate}_${timeStr}.xlsx`
  );
}

  // ✅ LOG OUT

function doLogout() {

    localStorage.removeItem("data");
    localStorage.removeItem("userName");
    localStorage.removeItem("location");
    localStorage.removeItem("areaPhotos");
  areaPhotos = {};
    currentArea = null;
    previousArea = null;
    photoTargetArea = null;
    renderAreaPhotoPanel(null);
    data = [];
    document.getElementById("userNameInput").value = "";
      currentLocation = null;
    if (selectedBtn) {
      selectedBtn.classList.remove("activeLocation");
      selectedBtn = null;
      }
  document.getElementById("appContent").style.display = "none";
  document.getElementById("locationSelect").style.display = "block";
  render();
}

function endSession() {
  const sessionStart = Number(localStorage.getItem("sessionStart"));
  const durationMs = Date.now() - sessionStart;
  const minutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
    if (data.length === 0) {
    doLogout();
  return;
  }
    const totalPackages =
      data.reduce(
      (sum, e) => sum + (e.packages || 0), 0);
    const totalM3 =
      data.reduce(
        (sum, e) => sum + (e.total || 0), 0);
      document.getElementById("logoutSummary")
        .innerHTML = `
          Ražotne: ${localStorage.getItem("location")}<br>
          Lietotājs: ${localStorage.getItem("userName")}<br><br>
          📊 Inventarizācija pabeigta!<br><br>
          📦 Reģistrētas ${totalPackages} paletes.<br>
          🪵 Kopā reģistrēti ${totalM3.toFixed(4)} m³.<br>
          📝 Veikti ${data.length} ieraksti.<br><br>
          ⏱️ Reģistrācija aizņēma ${hours} h ${remainingMinutes} min.
          `;
      document.getElementById("confirmModal")
    .style.display = "block";
}

function closeConfirmModal() {
  document.getElementById("confirmModal")
    .style.display = "none";
    }

function saveAndExit() {
  if (dataChanged) {
    saveBackup();
    exportBackupFile();
    dataChanged = false;
      showNotice(
        "✅ Izveidota rezerves kopija",
        "success"
        );
  } else {
    showNotice(
      "ℹ️ Izmaiņu nav, rezerves kopija netika veidota",
      "info"
      );
    }
  closeConfirmModal();
  doLogout();
  }

// ✅ BACKUP
function saveBackup() {
    const totalPackages = data.reduce(
            (sum, e) =>
                sum + (Number(e.packages) || 0), 0
        );
    const totalM3 = data.reduce(
            (sum, e) =>
                sum + (Number(e.total) || 0), 0
        );
    const now = new Date();
    const inventoryMonth =
        now.getMonth() + 1;
    const inventoryYear =
        now.getFullYear();
    const backup = {
        timestamp:
            now.toISOString(),
        user:
            localStorage.getItem("userName") || "",
        location:
            localStorage.getItem("location") || "",
        inventoryMonth:
            inventoryMonth,
        inventoryYear:
            inventoryYear,
        inventoryPeriod:
            `${String(inventoryMonth).padStart(2, "0")}.${inventoryYear}`,
        // ==============================================
        // 📷 VISI APGABALU FOTO
        // ==============================================
        areaPhotos:
            { ...areaPhotos },
        // ==============================================
        // 📊 KOPSAVILKUMS
        // ==============================================
        summary: {
            entries:
                data.length,
            packages:
                totalPackages,
            totalM3:
                Number(totalM3.toFixed(4))
        },
        // ==============================================
        // 📝 VISI IERAKSTI
        // ==============================================
        entries: data
    };
    try {
    localStorage.setItem(
        "backupData",
        JSON.stringify(backup)
    );
    localStorage.setItem(
        "areaPhotos",
        JSON.stringify(areaPhotos)
    );
} catch (error) {
    console.error("Neizdevās saglabāt backup:", error);
    showNotice(
        "❌ Nepietiek vietas rezerves kopijas saglabāšanai.",
        "error"
    );
    return;
}
    console.log(
        "💾 Backup saglabāts ar foto:",
        Object.keys(
            backup.areaPhotos || {}
        )
    );
    console.log(
        "📷 Foto skaits:",
        Object.keys(
            backup.areaPhotos || {}
        ).length
    );
}

function closeRestoreModal() {
document.getElementById("restoreModal")
.style.display = "none";
}

function restoreBackup() {
    const backupText =
        localStorage.getItem("backupData");
    if (!backupText) {
        showNotice(
            "❌ Backup dati nav atrasti!",
            "error"
        );
        return;
    }
    let backup;
    try {
        backup =
            JSON.parse(backupText);
    } catch (error) {
        console.error(
            "Backup JSON kļūda:",
            error
        );
        showNotice(
            "❌ Backup fails nav derīgs!",
            "error"
        );
        return;
    }
    // Atjauno ierakstus
    data =
        Array.isArray(backup.entries)
            ? backup.entries
            : [];
    localStorage.setItem(
        "data",
        JSON.stringify(data)
    );
    // Atjauno apgabalu foto
    areaPhotos =
        backup.areaPhotos &&
        typeof backup.areaPhotos === "object"
            ? { ...backup.areaPhotos }
            : {};
    // Saglabā arī atsevišķi
    localStorage.setItem(
        "areaPhotos",
        JSON.stringify(areaPhotos)
    );
    dataChanged = false;
    render();
    closeRestoreModal();
    showNotice(
        `✅ Atjaunoti ${data.length} ieraksti un ${
            Object.keys(areaPhotos).length
        } apgabalu foto.`,
        "success"
    );
    currentArea = null;
    previousArea = null;
    photoTargetArea = null;
    renderAreaPhotoPanel(null);
}

function discardBackup() {
  localStorage.removeItem("backupData");
      data = [];
  localStorage.removeItem("data");
    document.getElementById("backupFile").value = "";
    document.getElementById("backupInfo").textContent = "";
    document.getElementById("backupInfo").style.display = "none";
    localStorage.removeItem("areaPhotos");
        areaPhotos = {};
    renderAreaPhotoPanel(null);
  closeRestoreModal();
    document.getElementById("restoreModal")
  .style.display = "none";
    showNotice(
    "ℹ️ Sākta jauna inventarizācija",
    "info"
    );
}

function exportBackupFile() {
  const backup =
    JSON.parse(
    localStorage.getItem("backupData")
    );
  if (!backup) return;
  const location =
    safeFileName(backup.location);
  const user =
    safeFileName(backup.user);
  const d = new Date();
  const fileDate =
    String(d.getDate()).padStart(2, "0") + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
      d.getFullYear();
  const timeStr =
    String(d.getHours()).padStart(2, "0") +
    String(d.getMinutes()).padStart(2, "0") +
    String(d.getSeconds()).padStart(2, "0");
  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
    );
    saveAs(
      blob,
      `inv_${location}_${user}_${fileDate}_${timeStr}_backup.json`
    );
  dataChanged = false;
}

function buildAreaSummary(entries) {
  const summary = {};
    entries.forEach(entry => {
  if (!summary[entry.area]) {
    summary[entry.area] = {
      entries: 0,
      packages: 0,
      totalM3: 0
      };
    }
    summary[entry.area].entries++;
    summary[entry.area].packages +=
      Number(entry.packages) || 0;
    summary[entry.area].totalM3 +=
      Number(entry.total) || 0;
    });
  return summary;
}

async function importBackupFile(event) {
    const files = Array.from(event?.target?.files || []);
        if (files.length > 1) {
            importPhotos = confirm(
                "Importēt arī foto?\n\n" +
                "Foto palielina atmiņas patēriņu.\n" +
                "Ja veido kopēju backup no daudziem lietotājiem, ieteicams izvēlēties Nē."
                );
} else {
importPhotos = true;
}
    const backupInfo = document.getElementById("backupInfo");

    // ==========================================
    // 0. Ja faili nav izvēlēti
    // ==========================================
    if (files.length === 0) {
        backupInfo.style.display = "none";
        backupInfo.textContent = "";
        return;
    }

    backupInfo.textContent =
        `Pievienots ${files.length} Backup ${
            files.length === 1 ? "fails" : "faili"
        }`;

    backupInfo.style.display = "inline-block";

    try {

        // ==========================================
        // 1. Sagatavo mainīgos
        // ==========================================
        const backups = [];
        const uniqueEntries = [];
        const seen = new Set();

        let duplicates = 0;

        // ==========================================
        // 2. Nolasa VISUS izvēlētos backup failus
        // ==========================================
        for (const file of files) {
            let backup;
            try {
                const text = await file.text();
                backup = JSON.parse(text);
            } catch (error) {
                alert(
                    `Backup fails "${file.name}" nav derīgs JSON fails!`
                );
                return;
            }
            console.log(
                `Ielādētais backup "${file.name}":`,
                backup
            );
            // ==========================================
            // 2.1. Pārbauda backup struktūru
            // ==========================================
            if (!backup || typeof backup !== "object") {
                alert(
                    `Backup failā "${file.name}" nav derīgu datu!`
                );
                return;
            }
            if (!Array.isArray(backup.entries)) {
                alert(
                    `Backup failā "${file.name}" nav derīgu "entries" datu!`
                );
                return;
            }
            if (
                !backup.summary ||
                typeof backup.summary !== "object"
            ) {
                alert(
                    `Backup failā "${file.name}" nav derīgu "summary" datu!`
                );
                return;
            }
            // 2.2. Pievieno backup kopējam sarakstam
            backups.push(backup);
            // 2.3. Apvieno ierakstus un izņem dublikātus
            for (const entry of backup.entries) {
                if (!entry || typeof entry !== "object") {
                    continue;
                }
                const key = getEntryKey(entry);
                if (seen.has(key)) {
                    duplicates++;
                    continue;
                }
                seen.add(key);
                uniqueEntries.push(entry);
            }
        }
        // 3. Pārbauda, vai vispār ir backup
        if (backups.length === 0) {
            alert(
                "Nav atrasts neviens derīgs backup fails!"
            );
            return;
        }
        // 4. Nosaka aktīvo ražotni
        const currentLocation =
            localStorage.getItem("location");
        if (!currentLocation) {
            alert(
                "Nav iestatīta aktīvā ražotne!"
            );
            return;
        }
        // 5. Pārbauda, vai VISI backup ir
        //    no tās pašas ražotnes
        for (const backup of backups) {
            if (backup.location !== currentLocation) {
                alert(
                    `Nevar ielādēt backup!
Aktīvā ražotne: ${currentLocation}
Backup ražotne: ${
    backup.location || "Nav norādīta"
}`
                );
                return;
            }
        }
        // 6. Nosaka pašreizējo un iepriekšējo mēnesi
        const today = new Date();
        const currentMonth =
            today.getMonth() + 1;
        const currentYear =
            today.getFullYear();
        const previousDate = new Date(
            currentYear,
            currentMonth - 2,
            1
        );
        const previousMonth =
            previousDate.getMonth() + 1;
        const previousYear =
            previousDate.getFullYear();
        // 7. Pārbauda katra backup datumu
        for (const backup of backups) {
            const backupMonth =
                Number(backup.inventoryMonth);
            const backupYear =
                Number(backup.inventoryYear);
            const validCurrent =
                backupMonth === currentMonth &&
                backupYear === currentYear;
            const validPrevious =
                backupMonth === previousMonth &&
                backupYear === previousYear;
            if (!validCurrent && !validPrevious) {
                alert(
                    `Backup no lietotāja "${
                        backup.user || "Nezināms"
                    }" ir pārāk vecs un to nevar ielādēt.

Backup periods: ${
    backup.inventoryPeriod ||
    `${backupMonth}.${backupYear}`
}
Atļauts:
${currentMonth}.${currentYear}
vai
${previousMonth}.${previousYear}`
                );
                return;
            }
        }
        // ==========================================
        // 8. Apvieno lietotājus
        // ==========================================
        const users = [
            ...new Set(
                backups
                    .map(backup => backup.user)
                    .filter(Boolean)
            )
        ];
        const combinedUser =
            users.length === 0
                ? "Nav norādīts"
                : users.length === 1
                    ? users[0]
                    : users.join(", ");
        // ==========================================
        // 9. Izveido KOPĒJO summary
        // ==========================================
        const combinedSummary = {
            entries:
                uniqueEntries.length,
            packages:
                uniqueEntries.reduce(
                    (sum, e) =>
                        sum + Number(e.packages || 0),
                    0
                ),
            totalM3:
                uniqueEntries.reduce(
                    (sum, e) =>
                        sum + Number(e.total || 0),
                    0
                )
        };
        // ======================================================
        // 📷 APVIENO VISU BACKUP FAILU APGABALU FOTO
        // ======================================================
      const combinedAreaPhotos = {};
        if (importPhotos) {
            backups.forEach(backup => {
                if (
                  backup.areaPhotos &&
                typeof backup.areaPhotos === "object"
                ) {
                    Object.assign(
                    combinedAreaPhotos,
                    backup.areaPhotos
                );
              }
            });
        }
        // ==========================================
        // 10. Izveido vienotu importedBackup objektu
        // ==========================================
        importedBackup = {
            ...backups[0],
            duplicates,
            user: combinedUser,
            entries: uniqueEntries,
            summary: combinedSummary,
            inventoryMonth:
                backups[0].inventoryMonth,
            inventoryYear:
                backups[0].inventoryYear,
            inventoryPeriod:
                backups[0].inventoryPeriod,
            areaPhotos:
                combinedAreaPhotos
            };
        // ==========================================
        // 11. Debug informācija
        // ==========================================
        console.log(
            "Apvienotais backup:",
            importedBackup
        );
        console.log(
            "Backup faili:",
            backups.length
        );
        console.log(
            "Unikālie ieraksti:",
            uniqueEntries.length
        );
        console.log(
            "Dublikāti:",
            duplicates
        );
        // ==========================================
        // 12. Izveido apgabalu kopsavilkumu
        //     tikai no unikālajiem ierakstiem
        // ==========================================
        const areaSummary =
            buildAreaSummary(uniqueEntries);
        importedAreaSummary =
            areaSummary;
        console.log(
            "Apgabalu kopsavilkums:",
            areaSummary
        );
        // ==========================================
        // 13. Parāda informāciju import logā
        // ==========================================
        const importInfo =
            document.getElementById("importInfo");
        importInfo.innerHTML = `
            Ražotne: ${currentLocation}<br>
            Lietotājs: ${combinedUser}<br>
            Backup faili: ${backups.length}<br>
            Dublikāti: ${duplicates}<br>
            📷 Foto: ${importPhotos ? "Importēti" : "Izlaisti"}<br><br>
            📊 Inventarizācija<br>
            Ieraksti: ${combinedSummary.entries}<br>
            Paletes: ${combinedSummary.packages}<br>
            m³: ${Number(
                combinedSummary.totalM3.toFixed(4)
            )}
        `;
        // ==========================================
        // 14. Atver import modal
        // ==========================================
        const importModal =
            document.getElementById("importModal");
        importModal.style.display = "block";
        // ==========================================
        // 15. Parāda apgabalu sarakstu
        // ==========================================
        expandedArea = null;
        expandedAreaEntries = null;
        expandedSize = null;
        renderImportAreas();
    } catch (error) {
        console.error(
            "Backup importēšanas kļūda:",
            error
        );
        showNotice(
            "⚠️ Nederīgs backup fails",
            "error"
        );
    }
}

function renderImportAreas() {
    const areaList =
        document.getElementById("areaList");
    if (
        !areaList ||
        !importedAreaSummary ||
        !importedBackup ||
        !Array.isArray(importedBackup.entries)
    ) {
        if (areaList) {
            areaList.innerHTML = "";
        }
        return;
    }
    let areaHtml = "";
    Object.entries(importedAreaSummary)
        .sort(([a], [b]) =>
            a.localeCompare(
                b,
                undefined,
                { numeric: true }
            )
        )
        .forEach(([area, info]) => {
            // ==========================================
            // APGABALA IERAKSTI
            // ==========================================
            const areaEntries =
                importedBackup.entries.filter(
                    entry =>
                        entry.area === area
                );
            // ==========================================
            // GRUPĒ PĒC BIEZUMA × PLATUMA
            // ==========================================
            const sizeGroups = {};
            areaEntries.forEach(entry => {
                const thickness =
                    entry.thickness ?? "";
                const width =
                    entry.width ?? "";
                const size =
                    `${thickness}×${width}`;
                if (!sizeGroups[size]) {
                    sizeGroups[size] = [];
                }
                sizeGroups[size].push(entry);
            });
            const areaOpen =
                expandedArea === area;
            const entriesOpen =
                expandedAreaEntries === area;
            // ==========================================
            // 📷 APGABALA FOTO
            // ==========================================
            const photo =
                importedBackup.areaPhotos &&
                importedBackup.areaPhotos[area]
                    ? importedBackup.areaPhotos[area]
                    : null;
            // ==========================================
            // APGABALA BLOKS
            // ==========================================
            areaHtml += `
                <div class="areaBlock">
                    <label class="areaHeader">
                        <input
                            type="checkbox"
                            value="${area}">
                        <strong onclick="toggleArea('${area}')">
                            ${areaOpen ? "▼" : "▶"}
                            ${area}
                        </strong>
                    </label>
            `;
            // ==========================================
            // JA APGABALS IR ATVĒRTS
            // ==========================================
            if (areaOpen) {
                areaHtml += `
                    <div class="areaDetails">
                        <div class="areaEntriesHeader"
                            onclick="toggleAreaEntries('${area}')">
                                📄 ${info.entries} ieraksti
                                ${entriesOpen ? "▼" : "▶"}
                        </div> `;
                areaHtml += `
                        <div class="areaTotals">
                            📦 ${Number(info.packages || 0)
                                  .toLocaleString("lv-LV")} paletes<br>
                            🪵 ${Number(info.totalM3).toFixed(4)} m³
                        </div> `;
                if (photo) {
                    areaHtml += `
                        <div class="areaPhotoContainer">
                            <button
                                type="button"
                                onclick="viewImportedAreaPhoto('${area}')">
                                📷 Skatīt foto
                            </button>
                        </div>
                    `;
                } else {
                    areaHtml += `
                        <div class="areaPhotoMissing">
                                📷 Foto nav pievienots
                        </div>
                    `;
                }
        
                // ======================================
                // IERAKSTI ATVĒRTI
                // ======================================
                if (entriesOpen) {
                    Object.entries(sizeGroups)
                        .sort(([a], [b]) =>
                            a.localeCompare(
                                b,
                                undefined,
                                {
                                    numeric:true
                                }
                            )
                        )
                        .forEach(
                            ([size, entries]) => {
                                const sizeKey =
                                    `${area}_${size}`;
                                const sizeOpen =
                                    expandedSize === sizeKey;
                                // ==================================
                                // IZMĒRS
                                // ==================================
                                areaHtml += `
                                    <div class="areaSize"
                                        onclick="
                                            toggleSize(
                                                '${area}',
                                                '${size}'
                                            )">
                                        ${sizeOpen ? "▼" : "▶"}
                                        ${size}
                                    </div>
                                `;
                                // ==================================
                                // KONKRĒTIE IERAKSTI
                                // ==================================
                                if (sizeOpen) {
                                    entries.forEach(
                                        entry => {
                                            let lengthText = "";
                                            // Parasts garums
                                            if (
                                                String(
                                                    entry.length ?? ""
                                                )
                                                .trim()
                                                .toLowerCase()
                                                !== "gali"
                                            ) {
                                                lengthText =
                                                    entry.length ?? "";
                                            }
                                            // Gali
                                            else {
                                                lengthText =
                                                    entry.avgLength
                                                        ? `≈${entry.avgLength}`
                                                        : "Gali";
                                            }
                                            const packages =
                                                Number(
                                                    entry.packages
                                                ) || 0;
                                            areaHtml += `
                                                <div class="areaEntry">
                                                    ${entry.thickness}
                                                    ×${entry.width}
                                                    ×${lengthText}
                                                    |
                                                    ${packages} pal.
                                                </div>
                                            `;
                                        }
                                    );
                                }
                            }
                        );
                }
              areaHtml += `
                </div>
                `;
            }
            areaHtml += `
                </div>
            `;
        });
    // ==========================================
    // JA NAV APGABALU
    // ==========================================
    if (!areaHtml) {
        areaHtml = `
            <p>
                Nav atrasti apgabali
                ar derīgiem ierakstiem.
            </p>
        `;
    }
    areaList.innerHTML = areaHtml;
}
  
function getEntryKey(e) {
    return JSON.stringify([
        e.area,
        e.packages,
        e.thickness,
        e.width,
        e.length,
        e.avgLength,
        e.packWidth,
        e.packLength,
        e.packHeight,
        e.month,
        e.year,
        e.pieces,
        e.name,
        e.code,
        e.grade,
        e.comment,
        e.total,
        e.m3Pack
    ]);
}

function closeImportModal() {
document.getElementById("importModal")
  .style.display = "none";
}

function openBackupFile() {
  const fileInput = document.getElementById("backupFile");
    fileInput.value = "";
  const backupInfo =
    document.getElementById("backupInfo");
      backupInfo.style.display = "none";
      backupInfo.textContent = "";
      fileInput.click();
}

function restoreImportedBackup() {
    if (
        !importedBackup ||
        !Array.isArray(importedBackup.entries)
    ) {
        showNotice(
            "❌ Nav pieejami importētie backup dati!",
            "error"
        );
        return;
    }
    // ==============================================
    // 📝 ATJAUNO IERAKSTUS
    // ==============================================
    data =
        [...importedBackup.entries];
    localStorage.setItem(
        "data",
        JSON.stringify(data)
    );
    // ==============================================
    // 📷 ATJAUNO VISUS APGABALU FOTO
    // ==============================================
    areaPhotos =
        importedBackup.areaPhotos &&
        typeof importedBackup.areaPhotos === "object"
            ? {
                ...importedBackup.areaPhotos
            }
            : {};
    localStorage.setItem(
        "areaPhotos",
        JSON.stringify(areaPhotos)
    );
    dataChanged = true;
    // ==============================================
    // NOTĪRA BACKUP INPUT
    // ==============================================
    const backupFile =
        document.getElementById("backupFile");
    if (backupFile) {
        backupFile.value = "";
    }
    const backupInfo =
        document.getElementById("backupInfo");
    if (backupInfo) {
        backupInfo.textContent = "";
        backupInfo.style.display = "none";
    }
    // ==============================================
    // PĀRZĪMĒ APP
    // ==============================================
    render();
    // Izveido jauno lokālo backup
    saveBackup();
    closeImportModal();
    // ==============================================
    // PAZIŅOJUMS
    // ==============================================
    showNotice(
        `✅ Atjaunoti ${data.length} ieraksti.
        📷 Atjaunoti ${
            Object.keys(areaPhotos).length
        } apgabalu foto.
        Izlaisti ${
            importedBackup.duplicates || 0
        } dublikāti.`,
        "success"
    );
}

function restoreSelectedAreas() {
    if (
        !importedBackup ||
        !Array.isArray(importedBackup.entries)
    ) {
        showNotice(
            "❌ Nav pieejami importētie backup dati!",
            "error"
        );
        return;
    }
    // ==============================================
    // IZVĒLĒTIE APGABALI
    // ==============================================
    const selectedAreas = [
        ...document.querySelectorAll(
            "#areaList input:checked"
        )
    ].map(cb => cb.value);
    if (!selectedAreas.length) {
        showNotice(
            "⚠️ Izvēlies vismaz vienu apgabalu!",
            "error"
        );
        return;
    }
    // ==============================================
    // IZVĒLĒTIE IERAKSTI
    // ==============================================
    const selectedData =
        importedBackup.entries.filter(
            e =>
                selectedAreas.includes(e.area)
        );
    // ==============================================
    // ESOŠO IERAKSTU ATSLĒGAS
    // ==============================================
    const existingKeys =
        new Set(
            data.map(getEntryKey)
        );
    // ==============================================
    // ATLASA TIKAI JAUNOS IERAKSTUS
    // ==============================================
    const newEntries =
        selectedData.filter(e => {
            const key =
                getEntryKey(e);
            if (existingKeys.has(key)) {
                return false;
            }
            existingKeys.add(key);
            return true;
        });
    // ==============================================
    // 📷 ATJAUNO IZVĒLĒTO APGABALU FOTO
    // ==============================================
    let photosAdded = 0;
    selectedAreas.forEach(area => {
        const photo =
            importedBackup.areaPhotos &&
            importedBackup.areaPhotos[area];
        if (photo) {
            areaPhotos[area] =
                photo;
            photosAdded++;
        }
    });
    // ==============================================
    // PIEVIENO JAUNOS IERAKSTUS
    // ==============================================
    if (newEntries.length) {
        data.push(
            ...newEntries
        );
    }
    // ==============================================
    // JA NEBIJA NE IERAKSTU, NE FOTO
    // ==============================================
    if (
        !newEntries.length &&
        !photosAdded
    ) {
        showNotice(
            "ℹ️ Izvēlētie dati un foto jau atrodas darba režīmā. Nekas netika pievienots.",
            "info"
        );
        closeImportModal();
        return;
    }
    // ==============================================
    // 💾 SAGLABĀ
    // ==============================================
    localStorage.setItem(
        "data",
        JSON.stringify(data)
    );
    localStorage.setItem(
        "areaPhotos",
        JSON.stringify(areaPhotos)
    );
    dataChanged = true;
    // ==============================================
    // PĀRZĪMĒ
    // ==============================================
    render();
    // Izveido backup ar jaunajiem datiem + foto
    saveBackup();
    closeImportModal();
    // ==============================================
    // PAZIŅOJUMS
    // ==============================================
    showNotice(
        `✅ Pievienoti ${newEntries.length} jauni ieraksti no: ${selectedAreas.join(", ")}.
        📷 Atjaunoti ${photosAdded} apgabalu foto.`,
        "success"
    );
}
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/Inventory-app/sw.js")
        .then(reg => {
            console.log("SW registered");

            setInterval(() => {
                reg.update();
            }, 60000);
        })
        .catch(err => console.log("SW error", err));

    navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("New version loaded → reload");
        window.location.reload();
    });
}
