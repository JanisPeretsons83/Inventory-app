let data = [];
let editIndex = null;
let currentLocation = null;
let isGaliMode = false;
let dimensionsLibrary = [];

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
    "3-1", "4-1", "4-2", "4-3", "ZM", "B-L", "D-L", "N-1", "N-2", "N-3",
    "N-4", "N-5", "N-6", "N-7", "N-8", "N-9", "8-1", "8-2", "8-3",
    "8-4", "8-5", "8-6", "8-7", "9-5", "9-6", "9-7", "9-8", "9-9", "9-10",
    "9-11", "11-6", "11-7", "11-8", "11-9", "11-10", "11-11", "11-12",
    "11-13", "11-14",
    "11-15"
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

function showMessage(text) {
  const msg = document.getElementById("message");
  const packages = document.getElementById("packages");

    msg.innerText = text;
    msg.style.display = "block";
      setTimeout(() => {
    msg.style.display = "none";
    packages.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    packages.focus();
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
    alert("Izvēlies ražotni!");
    return;
  }

  if (!name) {
    alert("Ievadi vārdu!");
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
  
    if (!areaVal) return error("Apgabals obligāts");
    if (packagesVal <= 0 || isNaN(packagesVal))
      return error("Pakas obligātas");
    if (thicknessVal <= 0 || isNaN(thicknessVal))
      return error("Biezums obligāts");
    if (widthVal <= 0 || isNaN(widthVal))
      return error("Platums obligāts");
    const size = `${thicknessVal}x${widthVal}`;
  
    if (!dimensionsLibrary.includes(size)) {
        dimensionsLibrary.push(size);
        localStorage.setItem(
          "dimensionsLibrary",
      JSON.stringify(dimensionsLibrary)
        );
      }
  
    if (!monthVal || monthVal < 1 || monthVal > 12)
      return error("Mēnesis 1–12");
    if (!yearVal)
      return error("Gads obligāts");
    if (!document.getElementById("grade").value)
      return error("Izvēlies šķiru");
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

  if (
    packWidth <= 0 || isNaN(packWidth) ||
    packLength <= 0 || isNaN(packLength) ||
    packHeight <= 0 || isNaN(packHeight) ||
    avgLength <= 0 || isNaN(avgLength)
    ) {
  return error("Aizpildi pakas izmērus + vidējo garumu");
    }
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
      return error("Garums nav pareizs");
    if (piecesVal <= 0 || isNaN(piecesVal))
      return error("Gabali pakā obligāti");
   
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
  editIndex = null;
    document.getElementById("addBtn").innerText =
      "➕ Pievienot";
    document.getElementById("cancelEditBtn").style.display =
      "none";
  showMessage("✅ Labojums saglabāts");
} else {
    data.push(entry);
      showMessage("✅ Ieraksts pievienots");
}
    localStorage.setItem("data", JSON.stringify(data));

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
  showMessage("Labošana atcelta");
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
.addEventListener("change", updateYearFromMonth);
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
function error(msg) {
  document.getElementById("error").innerText = msg;
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
  }

// ✅ TABULAS SLĒPŠANA
  let tableVisible = true;
function toggleTable() {
  const t = document.getElementById("table");
    tableVisible = !tableVisible;
    t.style.display = tableVisible ? "table" : "none";
  }

function calculateGali() {
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
    alert("Nav datu eksportam!");
    return;
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
  
  document.getElementById("appContent").style.display = "none";
  document.getElementById("locationSelect").style.display = "block";

  render();
}


function endSession() {

  // ✅ JA NAV DATU → vienkārši iziet
  if (data.length === 0) {
    doLogout();
    return;
  }

  // ✅ IR DATI → gudrais dialogs
  const choice = confirm(
    "Tev ir ievadīti dati.\n\nOK = Saglabāt Excel un iziet\nCancel = Vēl neiziet"
  );

  if (choice) {
    // ✅ saglabā Excel
    exportExcel();

    // ✅ iziet
    doLogout();
  }

  // ❌ ja Cancel → neko nedara
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
