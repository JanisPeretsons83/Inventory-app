let data = [];

// ✅ parāda/slēpj “gali” lauku
length.addEventListener('input', () => {
  if (length.value.trim().toLowerCase() === "gali") {
    m3PackInput.style.display = "block";
  } else {
    m3PackInput.style.display = "none";
  }
});

function add() {
  const areaVal = area.value.trim();
  const packagesVal = Number(packages.value);
  const thicknessVal = Number(thickness.value);
  const widthVal = Number(width.value);
  const monthVal = Number(month.value);
  const yearVal = Number(year.value);

  // ✅ VALIDĀCIJA
  if (!areaVal) return error("Apgabals obligāts");
  if (!packagesVal) return error("Pakas obligātas");
  if (!thicknessVal) return error("Biezums obligāts");
  if (!widthVal) return error("Platums obligāts");

  if (!monthVal || monthVal < 1 || monthVal > 12)
    return error("Mēnesis 1–12");

  if (!yearVal)
    return error("Gads obligāts");

  let lengthVal = length.value.trim().toLowerCase();
  let piecesVal = Number(pieces.value);

  let totalM3 = 0;
  let m3PerPack = 0;

  // ✅ GALI režīms
  if (lengthVal === "gali") {
    m3PerPack = Number(m3PackInput.value);

    if (!m3PerPack) return error("Ievadi m³ vienā pakā");

    totalM3 = m3PerPack * packagesVal;
  } 
  // ✅ Normālais režīms
  else {
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
    name: name.value,
    code: productCode.value,
    m3Pack: m3PerPack,
    thickness: thicknessVal,
    width: widthVal,
    length: lengthVal,
    pieces: piecesVal,
    total: totalM3,
    month: monthVal,
    year: yearVal,
    grade: grade.value,
    comment: comment.value
  };

  data.push(entry);
  clearError();
  render();
}

function render() {
  let html = `
  <tr>
    <th>Apgabals</th>
    <th>Pakas</th>
    <th>Nosaukums</th>
    <th>Kods</th>
    <th>Mēn</th>
    <th>Gads</th>
    <th>Šķira</th>
    <th>m³/paka</th>
    <th>Kopā m³</th>
  </tr>`;

  data.forEach(e => {
    html += `
    <tr>
      <td>${e.area}</td>
      <td>${e.packages}</td>
      <td>${e.name || ""}</td>
      <td>${e.code || ""}</td>
      <td>${e.month}</td>
      <td>${e.year}</td>
      <td>${e.grade || ""}</td>
      <td>${e.m3Pack.toFixed(5)}</td>
      <td>${e.total.toFixed(5)}</td>
    </tr>`;
  });

  table.innerHTML = html;
}

function error(msg) {
  document.getElementById("error").innerText = msg;
}

function clearError() {
  document.getElementById("error").innerText = "";
}
``
