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
function isBetaUser() {
const user =
  (localStorage.getItem("userName") || "")
    .trim()
    .toLowerCase();
return betaUsers.includes(user);
}

if (isBetaUser()) {
// jaunā funkcija
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
    (sum, e) => sum + (Number(e.packages) || 0),
    0
  );

  const totalM3 = data.reduce(
    (sum, e) => sum + (Number(e.total) || 0),
    0
  );

  const now = new Date();

  const inventoryMonth = now.getMonth() + 1;
  const inventoryYear = now.getFullYear();

  const backup = {
    timestamp: now.toISOString(),

    user: localStorage.getItem("userName") || "",

    location: localStorage.getItem("location") || "",

    // Inventarizācijas periods
    inventoryMonth: inventoryMonth,
    inventoryYear: inventoryYear,
    inventoryPeriod: `${String(inventoryMonth).padStart(2, "0")}.${inventoryYear}`,

    // Kopsavilkums
    summary: {
      entries: data.length,
      packages: totalPackages,
      totalM3: Number(totalM3.toFixed(4)),
    },

    // Visi ieraksti ar saviem ražošanas datumiem
    entries: data,
  };

  localStorage.setItem(
    "backupData",
    JSON.stringify(backup)
  );
}

function closeRestoreModal() {
document.getElementById("restoreModal")
.style.display = "none";
}

function restoreBackup() {
  const backup =
    JSON.parse(localStorage.getItem("backupData")
      );
    data = backup.entries || [];
      localStorage.setItem("data",
    JSON.stringify(data)
      );
    dataChanged = false;
    render();
    closeRestoreModal();
  document.getElementById("restoreModal")
    .style.display = "none";
      showNotice(
`      ✅ Atjaunoti ${data.length} 
          ieraksti`,
        "success"
      );
}

function discardBackup() {
  localStorage.removeItem("backupData");
      data = [];
  localStorage.removeItem("data");
    document.getElementById("backupFile").value = "";
    document.getElementById("backupInfo").textContent = "";
    document.getElementById("backupInfo").style.display = "none";
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

            // ==========================================
            // 2.2. Pievieno backup kopējam sarakstam
            // ==========================================
            backups.push(backup);

            // ==========================================
            // 2.3. Apvieno ierakstus un izņem dublikātus
            // ==========================================
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

        // ==========================================
        // 3. Pārbauda, vai vispār ir backup
        // ==========================================
        if (backups.length === 0) {

            alert(
                "Nav atrasts neviens derīgs backup fails!"
            );

            return;
        }

        // ==========================================
        // 4. Nosaka aktīvo ražotni
        // ==========================================
        const currentLocation =
            localStorage.getItem("location");

        if (!currentLocation) {

            alert(
                "Nav iestatīta aktīvā ražotne!"
            );

            return;
        }

        // ==========================================
        // 5. Pārbauda, vai VISI backup ir
        //    no tās pašas ražotnes
        // ==========================================
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

        // ==========================================
        // 6. Nosaka pašreizējo un iepriekšējo mēnesi
        // ==========================================
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

        // ==========================================
        // 7. Pārbauda katra backup datumu
        // ==========================================
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
                backups[0].inventoryPeriod
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
            Dublikāti: ${duplicates}<br><br>
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
    const areaList = document.getElementById("areaList");
    if (
        !importedAreaSummary ||
        !importedBackup ||
        !Array.isArray(importedBackup.entries)
    ) {
        areaList.innerHTML = "";
        return;
    }
    let areaHtml = "";
    Object.entries(importedAreaSummary)
        .sort(([a], [b]) =>
            a.localeCompare(b, undefined, { numeric: true })
        )
        .forEach(([area, info]) => {
            // ==========================================
            // Šī apgabala ieraksti
            // ==========================================
            const areaEntries =
                importedBackup.entries.filter(
                    entry => entry.area === area
                );
            // ==========================================
            // Grupē pēc biezuma × platuma
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
            // APGABALS
            // ==========================================
            areaHtml += `
                <div class="areaBlock">
                    <label class="areaHeader">
                        <input
                            type="checkbox"
                            value="${area}"
                        >
                        <strong
                            onclick="toggleArea('${area}')"
                            style="cursor:pointer;"
                        >
                            ${areaOpen ? "▼" : "▶"}
                            ${area}
                        </strong>
                    </label>
            `;
            // ==========================================
            // Ja apgabals ir atvērts
            // ==========================================
            if (areaOpen) {
                areaHtml += `
                    <div class="areaDetails">
                        <div
                            class="areaEntriesHeader"
                            onclick="toggleAreaEntries('${area}')"
                            style="cursor:pointer;"
                        >
                            📄 ${info.entries} ieraksti
                            ${entriesOpen ? "▼" : "▶"}
                        </div>
                `;
                // ======================================
                // Ja "ieraksti" ir atvērti
                // ======================================
                if (entriesOpen) {
                    Object.entries(sizeGroups)
                        .sort(([a], [b]) =>
                            a.localeCompare(
                                b,
                                undefined,
                                { numeric: true }
                            )
                        )
                        .forEach(([size, entries]) => {
                            const sizeKey =
                                `${area}_${size}`;
                            const sizeOpen =
                                expandedSize === sizeKey;
                            // ==================================
                            // IZMĒRS
                            // ==================================
                            areaHtml += `
                                <div
                                    class="areaSize"
                                    onclick="toggleSize(
                                        '${area}',
                                        '${size}'
                                    )"
                                    style="
                                        cursor:pointer;
                                        margin-left:20px;
                                    "
                                >
                                    ${sizeOpen ? "▼" : "▶"}
                                    ${size}
                                </div>
                            `;
                            // ==================================
                            // KONKRĒTIE IERAKSTI
                            // ==================================
                            if (sizeOpen) {
                                entries.forEach(entry => {
                                    let lengthText = "";
                                    // ------------------------------
                                    // Parasts garums
                                    // ------------------------------
                                    if (
                                        String(
                                            entry.length ?? ""
                                        )
                                        .trim()
                                        .toLowerCase() !== "gali"
                                    ) {
                                        lengthText =
                                            entry.length ?? "";
                                    }
                                    // ------------------------------
                                    // Gali
                                    // ------------------------------
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
                                        <div
                                            class="areaEntry"
                                            style="
                                                margin-left:40px;
                                                padding:2px 0;
                                            "
                                        >
                                            ${entry.thickness}
                                            ×${entry.width}
                                            ×${lengthText}
                                            |
                                            ${packages} pal.
                                        </div>
                                    `;
                                });
                            }
                        });
                }
                // ======================================
                // APGABALA KOPSUMMAS
                // ======================================
                areaHtml += `
                        <div
                            class="areaTotals"
                            style="
                                margin-left:20px;
                                margin-top:8px;
                            "
                        >
                            📦 ${
                                Number(info.packages || 0)
                                .toLocaleString("lv-LV")
                            } paletes
                            <br>
                            🪵 ${
                                Number(info.totalM3 || 0)
                                .toFixed(4)
                            } m³
                        </div>
                    </div>
                `;
            }
            areaHtml += `
                </div>
            `;
        });
    // ==========================================
    // Ja nav neviena apgabala
    // ==========================================
    if (!areaHtml) {
        areaHtml = `
            <p>
                Nav atrasti apgabali ar derīgiem ierakstiem.
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
    if (!importedBackup || !Array.isArray(importedBackup.entries)) {
        showNotice("❌ Nav pieejami importētie backup dati!");
        return;
    }
    data = [...importedBackup.entries];
    localStorage.setItem("data", JSON.stringify(data));
  dataChanged = true;
  document.getElementById("backupFile").value = "";
  document.getElementById("backupInfo").textContent = "";
  document.getElementById("backupInfo").style.display = "none";
  render();
  saveBackup();
  closeImportModal();
  showNotice(
    `✅ Atjaunoti ${data.length} ieraksti. Izlaisti ${importedBackup.duplicates || 0} dublikāti.`,
    "success"
  );
}

function restoreSelectedAreas() {
    if (!importedBackup || !Array.isArray(importedBackup.entries)) {
        showNotice("❌ Nav pieejami importētie backup dati!");
        return;
    }
    const selectedAreas = [
        ...document.querySelectorAll("#areaList input:checked")
    ].map(cb => cb.value);
    if (!selectedAreas.length) {
        showNotice("⚠️ Izvēlies vismaz vienu apgabalu!");
        return;
    }
    const selectedData = importedBackup.entries.filter(e =>
        selectedAreas.includes(e.area)
    );
    if (!selectedData.length) {
        showNotice("⚠️ Izvēlētajos apgabalos backup failā dati nav atrasti!");
        return;
    }
    // Esošo ierakstu atslēgas
    const existingKeys = new Set(
        data.map(getEntryKey)
    );
    // Pievieno tikai jaunus ierakstus
    const newEntries = selectedData.filter(e => {
        const key = getEntryKey(e);
        if (existingKeys.has(key)) {
            return false;
        }
        existingKeys.add(key);
        return true;
    });
    if (!newEntries.length) {
        showNotice(
            "ℹ️ Izvēlētie dati jau atrodas darba režīmā. Nekas netika pievienots."
        );
        closeImportModal();
        return;
    }
    data.push(...newEntries);
    localStorage.setItem("data", JSON.stringify(data));
    dataChanged = true;
    render();
    saveBackup();
    closeImportModal();
    showNotice(
        `✅ Pievienoti ${newEntries.length} jauni ieraksti no: ${selectedAreas.join(", ")}`
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
