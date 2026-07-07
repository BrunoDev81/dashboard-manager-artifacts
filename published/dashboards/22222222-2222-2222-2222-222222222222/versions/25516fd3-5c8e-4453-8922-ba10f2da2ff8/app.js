const rows = [
  ["ABC123", "15%", "Em simulacao"],
  ["XYZ900", "22%", "Aprovado"],
  ["LMN456", "10%", "Revisao"]
];

const tbody = document.getElementById("rows");
for (const row of rows) {
  const tr = document.createElement("tr");
  for (const cell of row) {
    const td = document.createElement("td");
    td.textContent = cell;
    tr.appendChild(td);
  }
  tbody.appendChild(tr);
}
