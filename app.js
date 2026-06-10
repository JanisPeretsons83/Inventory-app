let data = [];

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

    let pieceVolume =
      (thicknessVal * widthVal * avgLength) / 1000000000;
        
        if (pieceVolume <= 0) return error("Nepareizs detaļas tilpums");
      piecesPerPack = Math.floor(m3PerPack / pieceVolume);

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
  
  localStorage.setItem("lastForm", JSON.stringify({
    area: areaVal,
    thickness: thicknessVal,
    width: widthVal,
    grade: document.getElementById("grade").value
  }));


  clearError();
  render();

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
    <th>Darbības</th>
  </tr>`;

  data.forEach((e, i) => {

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

      <td>
        <button class="action-btn" onclick="edit(${i})">✏️</button>
        <button class="action-btn" onclick="remove(${i})">🗑️</button>
      </td>

    </tr>`;
  });

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

  } else {

    document.getElementById("galiInputs").style.display = "none";

    document.getElementById("packWidth").value = "";
    document.getElementById("packLength").value = "";
    document.getElementById("packHeight").value = "";
    document.getElementById("avgLength").value = "";
  }

  data.splice(i, 1);

  localStorage.setItem("data", JSON.stringify(data));

  render();
}

window.onload = () => {

  const savedData = localStorage.getItem("data");

  if (savedData) {
    data = JSON.parse(savedData);
    render();
  }

  const lengthInput = document.getElementById("length");
  const block = document.getElementById("galiInputs");

  if (savedArea) {
    document.getElementById("area").value = savedArea;
  }

  lengthInput.addEventListener("change", (e) => {

    const val = e.target.value.trim().toLowerCase();

    block.style.display =
      val === "gali" ? "block" : "none";
  });
  
if (lengthVal === "gali") {
  document.getElementById("galiInputs").style.display = "block";
}

    const savedForm = localStorage.getItem("lastForm");
      if (savedForm) {  
        const f = JSON.parse(savedForm);  
          document.getElementById("area").value = f.area || "";  
          document.getElementById("thickness").value = f.thickness || "";  
          document.getElementById("width").value = f.width || "";  
          document.getElementById("grade").value = f.grade || "";
      }
};

// ✅ ERROR
function error(msg) {
  document.getElementById("error").innerText = msg;
}

function clearError() {
  document.getElementById("error").innerText = "";
}

let tableVisible = true;

function toggleTable() {

  const t = document.getElementById("table");

  tableVisible = !tableVisible;

  t.style.display =
    tableVisible ? "table" : "none";
}
