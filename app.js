let data = [];

// ✅ Login

let selectedBtn = null;

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

  if (!monthVal || monthVal < 1 || monthVal > 12)
    return error("Mēnesis 1–12");

  if (!yearVal)
    return error("Gads obligāts");

  let rawLength = document.getElementById("length").value.trim();
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

    // ✅ REĀLAIS GABALU APRĒĶINS
    let crossSection = thicknessVal * widthVal;
    let packSection = packWidth * packHeight;

    let piecesInLayer = Math.floor(packSection / crossSection);
    let layers = Math.floor(packLength / avgLength);

    let efficiency = 0.7;

    piecesPerPack = Math.max(1,
      Math.floor(piecesInLayer * layers * efficiency)
    );

    // ✅ UZREIZ PARĀDA LAUKĀ
    document.getElementById("pieces").value = piecesPerPack;

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

  data.push(entry);
  localStorage.setItem("data", JSON.stringify(data));

  // ✅ saglabā formu
  localStorage.setItem("lastForm", JSON.stringify({
    area: areaVal,
    thickness: thicknessVal,
    width: widthVal,
    grade: document.getElementById("grade").value
  }));

  clearError();
  render();

  // ✅ tīra tikai mainīgos laukus
  document.getElementById("length").value = "";
  document.getElementById("pieces").value = "";
  document.getElementById("packWidth").value = "";
  document.getElementById("packLength").value = "";
  document.getElementById("packHeight").value = "";
  document.getElementById("avgLength").value = "";

  document.getElementById("length").focus();
  document.getElementById("galiInputs").style.display = "none";
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

  
data.forEach((e, i) => {

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

  document.getElementById("area").value = e.area;
  document.getElementById("packages").value = e.packages;
  document.getElementById("thickness").value = e.thickness;
  document.getElementById("width").value = e.width;
  document.getElementById("length").value = e.length;
  document.getElementById("month").value = e.month;
  document.getElementById("year").value = e.year;

  document.getElementById("name").value = e.name;
  document.getElementById("productCode").value = e.code;
  document.getElementById("grade").value = e.grade;
  document.getElementById("comment").value = e.comment;

  if ((e.length || "").toLowerCase() === "gali") {
    document.getElementById("galiInputs").style.display = "block";

    document.getElementById("packWidth").value = e.packWidth;
    document.getElementById("packLength").value = e.packLength;
    document.getElementById("packHeight").value = e.packHeight;
    document.getElementById("avgLength").value = e.avgLength || "";
  }

  data.splice(i, 1);
  localStorage.setItem("data", JSON.stringify(data));
  render();
}


window.onload = () => {

  const location = localStorage.getItem("location");
  const name = localStorage.getItem("userName");
  const savedData = localStorage.getItem("data");

  // LOGIN CHECK
  if (location && name) {
    currentLocation = location;

    document.getElementById("locationSelect").style.display = "none";
    document.getElementById("appContent").style.display = "block";

    setHeaderInfo();
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
  
// ✅ GALI toggle

const lengthInput = document.getElementById("length");
const block = document.getElementById("galiInputs");

if (lengthInput && block) {
  lengthInput.addEventListener("input", (e) => {
    const val = (e.target.value || "").trim().toLowerCase();
    const isGali = val === "gali";

    block.style.display = isGali ? "block" : "none";

    if (isGali) calculateGali();
  });
}

  // LOAD FORM
  const savedForm = localStorage.getItem("lastForm");
  if (savedForm) {
    const f = JSON.parse(savedForm);
    document.getElementById("area").value = f.area || "";
    document.getElementById("thickness").value = f.thickness || "";
    document.getElementById("width").value = f.width || "";
    document.getElementById("grade").value = f.grade || "";
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
  ) {
    return;
  }

  let crossSection = thicknessVal * widthVal;
  let packSection = packWidth * packHeight;

  let piecesInLayer = Math.floor(packSection / crossSection);
  let layers = Math.floor(packLength / avgLength);

  let efficiency = 0.7;

  let piecesPerPack =
    Math.max(1, Math.floor(piecesInLayer * layers * efficiency));

  // ✅ IEVIETO LAUKĀ
  document.getElementById("pieces").value = piecesPerPack;
}

  //
async function exportExcel() {

  if (data.length === 0) {
    alert("Nav datu eksportam!");
    return;
  }

  const location = localStorage.getItem("location") || "";
  const name = localStorage.getItem("userName") || "";

  const d = new Date();

  const dateStr =
    String(d.getDate()).padStart(2, "0") + "." +
    String(d.getMonth() + 1).padStart(2, "0") + "." +
    d.getFullYear();

  const fileDate =
    String(d.getDate()).padStart(2, "0") + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    d.getFullYear();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Inventarizācija");

  // ✅ TITLE
  ws.mergeCells("A1:N1");
  ws.getCell("A1").value = "Nepabeigtas Ražošanas Inventarizācijas protokols";
  ws.getCell("A1").alignment = { horizontal: "center" };
  ws.getCell("A1").font = { bold: true, size: 14 };

  // ✅ INFO RINDA
  ws.getCell("A3").value = "Datums:";
  ws.getCell("B3").value = dateStr;

  ws.getCell("E3").value = "Sastādīja:";
  ws.getCell("F3").value = name;

  ws.getCell("I3").value = "Ražotne:";
  ws.getCell("J3").value = location;

  // ✅ HEADER
  const headerRow = 5;

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
    "m3 kopā"
  ];

  const header = ws.addRow(headers);

  header.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" } // pelēks
    };

    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  });

  // ✅ DATA
  
let startRow = 5;
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
    e.length,

    e.pieces,
    Number(pieceM3.toFixed(5)),

    String(e.month).padStart(2, "0"),
    e.year < 100 ? "20" + e.year : e.year,

    e.grade,
    e.comment,
    { formula: `B${rowIndex}*E${rowIndex}` }
  ]);

  row.eachCell(cell => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  });
});

  let lastRow = ws.rowCount;

  // ✅ SUM
  ws.addRow([]);

ws.addRow([
  "Pakas kopā:",
  { formula: `SUM(B${startRow}:B${lastRow})`, result: totalPackages }
]);
  
ws.addRow([
  "m3 kopā:",
  { formula: `SUM(O${startRow}:O${lastRow})` }
]);


  // ✅ COLUMN WIDTH
  [
    10, 12, 25, 20, 14,
    10, 10, 10,
    16, 10,
    10, 10,
    10, 25
  ].forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  // ✅ SAVE
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), `inv_${fileDate}.xlsx`);
}


  // ✅ LOG OUT
function endSession() {

  const confirmSave = confirm("Vai ievadītie dati tika saglabāti?");

  if (data.length === 0) {
    alert("Nav datu ko dzēst");
    return;
  }

  if (confirmSave) {

    // ✅ dzēš datus
    localStorage.removeItem("data");
    data = [];

    // ✅ dzēš lietotāju (ja gribi pilnu restartu)
    localStorage.removeItem("userName");
    localStorage.removeItem("location");

    // ✅ atgriežas uz login
    document.getElementById("appContent").style.display = "none";
    document.getElementById("locationSelect").style.display = "block";

    // ✅ notīra tabulu
    render();

  } else {

    // ❌ neko nedara
    alert("Saglabā datus pirms iziešanas!");

  }
}
