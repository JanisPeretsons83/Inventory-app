let data = [];

// ✅ “gali” režīms (strādā arī iPhone)
window.onload = () => {

  document.getElementById("length").addEventListener("change", (e) => {
    const val = e.target.value.trim().toLowerCase();

    
if (lengthVal === "gali") {

  const pW = Number(document.getElementById("packWidth").value);
  const pL = Number(document.getElementById("packLength").value);
  const pH = Number(document.getElementById("packHeight").value);

  if (!pW || !pL || !pH)
    return error("Aizpildi pakas izmērus");

  // ✅ m³ vienā pakā
  m3PerPack = (pW * pL * pH) / 1000000000;

  // ✅ kopējais m³
  totalM3 = m3PerPack * packagesVal;
}

  });

};

// ✅ PIEVIENO IERAKSTU
function add() {

  const areaVal = document.getElementById("area").value.trim();
  const packagesVal = Number(document.getElementById("packages").value);
  const thicknessVal = Number(document.getElementById("thickness").value);
  const widthVal = Number(document.getElementById("width").value);

  const monthVal = Number(document.getElementById("month").value);
  const yearVal = Number(document.getElementById("year").value);

  if (!areaVal) return error("Apgabals obligāts");
  if (!packagesVal) return error("Pakas obligātas");
  if (!thicknessVal) return error("Biezums obligāts");
  if (!widthVal) return error("Platums obligāts");

  if (!monthVal || monthVal < 1 || monthVal > 12)
    return error("Mēnesis 1–12");

  if (!yearVal)
    return error("Gads obligāts");

  let rawLength = document.getElementById("length").value.trim();
  let lengthVal = rawLength.toLowerCase();
  let piecesVal = Number(document.getElementById("pieces").value);

  let totalM3 = 0;
  let m3PerPack = 0;

  // ✅ GALI režīms
  if (lengthVal === "gali") {

    m3PerPack = Number(document.getElementById("m3PackInput").value);

    if (!m3PerPack) return error("Ievadi m³ vienā pakā");

    totalM3 = m3PerPack * packagesVal;

  } else {

    let lengthNum = Number(rawLength);

    if (!lengthNum) return error("Garums nav pareizs");
    if (!piecesVal) return error("Gabali pakā obligāti");

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
    pieces: piecesVal,
    month: monthVal,
    year: yearVal,
    name: document.getElementById("name").value,
    code: document.getElementById("productCode").value,
    grade: document.getElementById("grade").value,
    comment: document.getElementById("comment").value,
    m3Pack: m3PerPack,
    total: totalM3
  };

  data.push(entry);

  clearError();
  render();
}

// ✅ TABULA (tikai svarīgais preview)
function render() {

  let html = `
  <tr>
    <th>Apgabals</th>
    <th>Pakas</th>
    <th>Izmērs</th>
    <th>Darbības</th>
  </tr>`;

  data.forEach((e, i) => {

    let size =
      e.length.toLowerCase() === "gali"
        ? "gali"
        : `${e.thickness}×${e.width}×${e.length}`;

    html += `
    <tr>
      <td>${e.area}</td>
      <td>${e.packages}</td>
      <td>${size}</td>
      <td>
        <button onclick="edit(${i})">✏️</button>
        <button onclick="remove(${i})">🗑️</button>
      </td>
    </tr>`;
  });

  document.getElementById("table").innerHTML = html;
}

// ✅ DELETE
function remove(i) {
  data.splice(i, 1);
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
  document.getElementById("pieces").value = e.pieces;
  document.getElementById("month").value = e.month;
  document.getElementById("year").value = e.year;
  document.getElementById("name").value = e.name;
  document.getElementById("productCode").value = e.code;
  document.getElementById("grade").value = e.grade;
  document.getElementById("comment").value = e.comment;

  if (e.length.toLowerCase() === "gali") {
    document.getElementById("m3PackInput").style.display = "block";
    document.getElementById("m3PackInput").value = e.m3Pack;
  }

  data.splice(i, 1);
  render();
}

// ✅ ERROR
function error(msg) {
  document.getElementById("error").innerText = msg;
}

function clearError() {
  document.getElementById("error").innerText = "";
}
