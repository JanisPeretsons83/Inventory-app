let data = [];
let editIndex = null;
let currentLocation = null;
let isGaliMode = false;
let dimensionsLibrary = [];
let importedBackup = null;
let importedAreaSummary = null;
let dataChanged = false;

// ✅ Login

let selectedBtn = null;
const areasByLocation = {

  "Dārdu": [
    "2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "3-1", "3-2", "3-3", "3-4",
    "3-5", "3-6", "3-7", "4-1", "5-1", "5-2", "6-1", "7-1", "7-2", "7-3",
    "7-4", "7-5", "7-6", "9-1", "9-2", "9-3", "9-4", "9-5", "9-6", "9-7",
    "9-8", "9-9", "9-10", "9-11", "9-12", "9-13", "9-14", "9-15", "10-1",
    "10-2", "10-3", "10-4", "10-5", "11-1", "11-2", "11-3", "11-4", "11-5",
    "12-1", "12-2", "12-3", "12-4", "12-5"
  ],

  "Cecīļu": [
    "2-1", "3-1", "4-1", "4-2", "4-3", "6-1", "6-2", "7-1", "7-2", "7-3", "8-1", "8-2", "8-3",
    "8-4", "8-5", "8-6", "8-7", "9-1", "9-2", "9-3", "9-4", "9-5", "9-6", "9-7", "9-8", "9-9", "9-10",
    "9-11", "9-12", "11-1", "11-2", "11-3", "11-4", "11-5", "11-6", "11-7", "11-8", "11-9", "11-10",
    "11-11", "11-12", "11-13", "11-14", "11-15", "ZM", "B-L", "D-L", "N-1", "N-2", "N-3",
    "N-4", "N-5", "N-6", "N-7", "N-8", "N-9", "P-N"
  ]

};

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
    .slice(0, 5);
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
  
    if (!dimensionsLibrary.includes(size)) {
        dimensionsLibrary.push(size);
        localStorage.setItem(
          "dimensionsLibrary",
      JSON.stringify(dimensionsLibrary)
        );
      }
  
    if (!monthVal || monthVal < 1 || monthVal > 12)
      return error("Mēnesis 1–12", "month");
  
    if (!yearVal)
      return error("Gads obligāts", "year");
  
    if (!document.getElementById("grade").value)
      return error("Izvēlies šķiru", "gradeBtn");
  
  let rawLength = document.getElementById("length").value.trim();
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

  // ✅ GALI režīms
  
  if (lengthVal === "gali") {

    packWidth = Number(document.getElementById("packWidth").value);
    packLength = Number(document.getElementById("packLength").value);
    packHeight = Number(document.getElementById("packHeight").value);
    avgLength = Number(document.getElementById("avgLength").value);

    if (packWidth <= 0 || isNaN(packWidth))
      return error("Pakas platums obligāts", "packWidth");
    if (packLength <= 0 || isNaN(packLength))
      return error("Pakas garums obligāts", "packLength");
    if (packHeight <= 0 || isNaN(packHeight))
      return error("Pakas augstums obligāts", "packHeight");
    if (avgLength <= 0 || isNaN(avgLength))
      return error("Vidējais garums obligāts", "avgLength")
    
    m3PerPack =
      (packWidth * packLength * packHeight) / 1000000000;

  let piecesAcrossWidth = Math.floor(packWidth / widthVal);
  let piecesAcrossHeight = Math.floor(packHeight / thicknessVal);
  let piecesFront = piecesAcrossWidth * piecesAcrossHeight;
  let columns = Math.floor(packLength / avgLength);
  let efficiency = 0.95;
    piecesPerPack = Math.max(1, Math.floor(piecesFront * columns * efficiency)
    );

    // ✅ parāda ar ≈
    document.getElementById("pieces").value = "≈ " + piecesPerPack;
    totalM3 = m3PerPack * packagesVal;

  } else {

    let lengthNum = Number(rawLength);
    let piecesVal = Number(document.getElementById("pieces").value);
    if (lengthNum <= 0 || isNaN(lengthNum))
      return error("Garums nav pareizs", "length");
    if (piecesVal <= 0 || isNaN(piecesVal))
      return error("Gabali pakā obligāti", "pieces");
    piecesPerPack = piecesVal;
    m3PerPack =
      (thicknessVal * widthVal * lengthNum * piecesVal) / 1000000000;
    totalM3 = m3PerPack * packagesVal;
  }

  const entry = {
    area: areaVal,
    packages: packagesVal,
    thickness: thicknessVal,
    width: widthVal,
    length: rawLength,
    month: monthVal,
    year: yearVal,
    packWidth,
    packLength,
    packHeight,
    pieces: piecesPerPack,
    avgLength,
    name: document.getElementById("name").value,
    code: document.getElementById("productCode").value,
    grade: document.getElementById("grade").value,
    comment: document.getElementById("comment").value,
    m3Pack: m3PerPack,
    total: totalM3
  };

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
    localStorage.setItem("data", JSON.stringify(data));
      saveBackup();
  clearError();
  render();
  
  // ✅ tīrīšana
  clearForm();
    document.getElementById("galiInputs").style.display = "none";
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
  
document.getElementById("backupFile")
          .addEventListener("change", importBackupFile);
  
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
          Pakas: ${backup.summary.packages}<br>
          m³: ${backup.summary.totalM3}<br><br>
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
    "m3",
    "Mēnesis",
    "Gads",
    "Šķira",
    "Komentārs",
    "",
    "m3 kopā"
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
      e.area,
      e.packages,
      e.name,
      e.code,
      Number(e.m3Pack?.toFixed(4)),
      e.thickness,
      e.width,      
      (e.length || "").toLowerCase() === "gali"
        ? e.avgLength || ""
        : Number(e.length),
      e.pieces,
      Number(pieceM3.toFixed(5)),
      String(e.month).padStart(2, "0"),
      e.year < 100 ? "20" + e.year : e.year,
      e.grade,
      e.comment,
      (e.length || "").toLowerCase() === "gali" ? "Gali" : "",
      { formula: `B${rowIndex}*E${rowIndex}` }
    ]);

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
  ws.addRow([
    "m3 kopā:",
    { formula: `SUM(P${startRow}:P${lastRow})` }
  ]);

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
          📊 Inventarizācija<br>
          Ieraksti: ${data.length}<br>
          Pakas: ${totalPackages}<br>
          m³: ${totalM3.toFixed(4)}
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

// ✅ SERVICE WORKER

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/Inventory-app/sw.js")
    .then(reg => {
      console.log("SW registered");
      // ✅ pārbauda update
      setInterval(() => {
        reg.update();
      }, 60000); // ik 60 sekundes
    })
    .catch(err => console.log("SW error", err));
}

// ✅ BACKUP
function saveBackup() {
    const totalPackages =
      data.reduce((sum, e) =>
      sum + (e.packages || 0), 0);
    const totalM3 =
      data.reduce((sum, e) =>
      sum + (e.total || 0), 0);
    const backup = {
      timestamp: new Date().toISOString(),
      user:
        localStorage.getItem("userName") || "",
      location:
        localStorage.getItem("location") || "",
      summary: {
      entries: data.length,
      packages: totalPackages,
      totalM3: Number(totalM3.toFixed(4))
        },
      entries: data
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
      entry.packages || 0;
    summary[entry.area].totalM3 +=
      entry.total || 0;
    });
  return summary;
}

function importBackupFile(event) {
  const file = event.target.files[0];
    if (!file) return;
  const reader = new FileReader();
      reader.onload = (e) => {
    try {
  const backup =
    JSON.parse(e.target.result);
      importedBackup = backup;
        const areas = [
          ...new Set(
            backup.entries.map(
              e => e.area
              )
            )
          ].sort();
        const areaSummary =
      buildAreaSummary(
        importedBackup.entries
      );
      importedAreaSummary = areaSummary;
      document.getElementById("importInfo")
        .innerHTML = `
          Ražotne: ${backup.location}<br>
          Lietotājs: ${backup.user}<br><br>
          📊 Inventarizācija<br>
          Ieraksti: ${backup.summary.entries}<br>
          Pakas: ${backup.summary.packages}<br>
          m³: ${backup.summary.totalM3}
          `;
      document.getElementById("importModal")
        .style.display = "block";
          let areaHtml = "";
            Object.entries(areaSummary)
              .forEach(([area, info]) => {
                areaHtml += `
                  <label>
                    <input
                      type="checkbox"
                      value="${area}">
                      <strong>${area}</strong><br>
                      ${info.entries} ieraksti<br>
                      ${info.packages} pakas<br>
                      ${info.totalM3.toFixed(4)} m³
                  </label>
                <hr>
              `;
            });
        document.getElementById("areaList")
          .innerHTML = areaHtml;
    } catch {
    showNotice(
      "⚠️ Nederīgs backup fails",
      "error"
      );
    }
  };
  reader.readAsText(file);
}

function closeImportModal() {
document.getElementById("importModal")
.style.display = "none";
}

function openBackupFile() {
document.getElementById("backupFile")
.click();
}

function restoreImportedBackup() {
  data = importedBackup.entries || [];
  localStorage.setItem(
    "data",
  JSON.stringify(data)
    );
  dataChanged = false;
  render();
  saveBackup();
  closeImportModal();
  showNotice(
  `✅ Atjaunoti ${data.length} ieraksti`,
  "success"
  );
}

function restoreSelectedAreas() {
  const selectedAreas =
    [...document.querySelectorAll(
      "#areaList input:checked"
      )]
    .map(cb => cb.value);
  const selectedData =
    importedBackup.entries.filter(
    e => selectedAreas.includes(e.area)
    );
    data.push(...selectedData);
      localStorage.setItem(
        "data",
    JSON.stringify(data)
      );
    dataChanged = false;
      render();
      saveBackup();
      closeImportModal();
      showNotice(
      `✅ Atjaunoti ${selectedData.length} ieraksti`,
      "success"
  );
}

// ✅ INSTALL PROMPT (Android)
let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("Install pieejams");
});

// ✅ AUTO REFRESH JA IR JAUNA VERSIJA
  navigator.serviceWorker.addEventListener("controllerchange", () => {
  console.log("New version loaded → reload");
  window.location.reload();
});
