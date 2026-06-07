let data = [];

// ✅ PAGAIDI līdz DOM ielādēts
window.onload = () => {

  document.getElementById("length").addEventListener("change", (e) => {
    const val = e.target.value.trim().toLowerCase();

    if (val === "gali") {
      document.getElementById("m3PackInput").style.display = "block";
    } else {
      document.getElementById("m3PackInput").style.display = "none";
    }
  });

};

// ✅ GALVENĀ FUNKCIJA (SALABOTA)
function add() {

  const areaVal = document.getElementById("area").value.trim();
  const packagesVal = Number(document.getElementById("packages").value);
  const thicknessVal = Number(document.getElementById("thickness").value);
  const widthVal = Number(document.getElementById("width").value);

  const monthVal = Number(document.getElementById("month").value);
  const yearVal = Number(document.getElementById("year").value);

  // ✅ VALIDĀCIJA
  if (!areaVal) return error("Apgabals obligāts");
  if (!packagesVal) return error("Pakas obligātas");
  if (!thicknessVal) return error("Biezums obligāts");
  if (!widthVal) return error("Platums obligāts");

  if (!monthVal || monthVal < 1 || monthVal > 12)
    return error("Mēnesis 1–12 obligāts");

  if (!yearVal)
    return error("Gads obligāts");

  let lengthVal = document.getElementById("length").value.trim().toLowerCase();
  let piecesVal = Number(document.getElementById("pieces").value);

  let totalM3 = 0;
  let m3PerPack = 0;

  // ✅ GALI FIX
  if (lengthVal === "gali") {

    m3PerPack = Number(document.getElementById("m3PackInput").value);

    if (!m3PerPack) return error("Ievadi m³ vienā pakā");

    totalM3 = m3PerPack * packagesVal;

  } else {

    lengthVal = Number(lengthVal);

    if (!lengthVal) return error("Garums nav pareizs");
    if (!piecesVal) return error("Gabali pakā obligāti");

    m3PerPack =
      (thicknessVal * widthVal * lengthVal * piecesVal) / 1000000000;

    totalM3 = m3PerPack * packagesVal;
  }

  const entry = {
    area: areaVal,
    packages: packagesVal,
    total: totalM3,
    m3Pack: m3PerPack,
    month: monthVal,
    year: yearVal,
  };

  data.push(entry);

  clearError();
  render();
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

    let size = e.length === "gali"
      ? "gali"
      : `${e.thickness}x${e.width}x${e.length}`;

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


// ✅ ERROR
function error(msg) {
  document.getElementById("error").innerText = msg;
}

// ✅ CLEAR ERROR
function clearError() {
  document.getElementById("error").innerText = "";
}
