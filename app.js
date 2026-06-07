let data = [];
function add() {
 const areaVal = area.value.trim();
 const packagesVal = Number(packages.value);
 const thicknessVal = Number(thickness.value);
 const widthVal = Number(width.value);
 if (!areaVal) return error("Apgabals obligāts");
 if (!packagesVal) return error("Pakas obligātas");
 if (!thicknessVal) return error("Biezums obligāts");
 if (!widthVal) return error("Platums obligāts");
 let lengthVal = length.value.trim();
 let piecesVal = Number(pieces.value);
 let totalM3 = 0;
 if (lengthVal === "gali") {
   totalM3 = Number(prompt("Ievadi m3"));
 } else {
   lengthVal = Number(lengthVal);
   totalM3 = (thicknessVal * widthVal * lengthVal * piecesVal * packagesVal) / 1000000000;
 }
 data.push({area: areaVal, packages: packagesVal, total: totalM3});
 render();
}
function render() {
 let html = "<tr><th>Apgabals</th><th>Pakas</th><th>m3</th></tr>";
 data.forEach(e=>{
  html += `<tr><td>${e.area}</td><td>${e.packages}</td><td>${e.total.toFixed(5)}</td></tr>`;
 });
 table.innerHTML = html;
}
function error(msg) {
 document.getElementById("error").innerText = msg;
}