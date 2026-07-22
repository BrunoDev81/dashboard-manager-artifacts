const TEMPLATE = {"charts":["funnel","line","ranking"],"description":"Dashboard para analizar ventas, volumen, cumplimiento y evolucion comercial.","key":"sales-performance","insights":["Oportunidad prioritaria","Desvio relevante","Accion sugerida","Riesgo controlado"],"category":"COMERCIAL","layout":"sales-performance-center","name":"Performance de Ventas","kpis":["Ventas netas","Volumen","Cumplimiento","Ticket promedio"],"editableStateKeys":["comentarios","acciones","metas"]};
const demoRows = Array.from({ length: 6 }, (_, index) => ({
  item: `${TEMPLATE.category} demo ${index + 1}`,
  area: index % 2 ? "Region Sur" : "Region Norte",
  value: 1000 + index * 231,
  status: index % 3 === 0 ? "Atencion" : index % 2 ? "En seguimiento" : "OK",
  owner: `Responsable ${index + 1}`
}));
const chartData = ["Ene", "Feb", "Mar", "Abr", "May"].map((label, index) => ({ label, value: 42 + ((index + TEMPLATE.key.length) * 11) % 52 }));

function $(id) { return document.getElementById(id); }
function show(id, visible) { const el = $(id); if (el) el.classList.toggle("hidden", !visible); }
function renderKpis() {
  $("kpis").innerHTML = TEMPLATE.kpis.slice(0, 4).map((label, index) => `<article class="kpi-card"><span>${label}</span><strong>${index === 0 ? "$12.5M" : index === 1 ? "84%" : index === 2 ? "128" : "7.2d"}</strong><em class="trend">${index === 1 ? "-1.4%" : "+" + (6 + index) + ".2%"}</em></article>`).join("");
}
function renderVisual(type) {
  if (type === "funnel") return `<div class="funnel">${chartData.map((d,i)=>`<div style="width:${95-i*13}%;background:${i%2?"var(--template-secondary)":"var(--template-primary)"}">${d.label} - ${d.value}</div>`).join("")}</div>`;
  if (type === "risk-matrix") return `<div class="matrix">${Array.from({length:9},(_,i)=>`<span></span>`).join("")}</div>`;
  if (type === "kanban") return `<div class="kanban">${["Pendiente","En curso","Critico"].map(l=>`<div class="lane"><b>${l}</b>${demoRows.slice(0,3).map(r=>`<span>${r.item}</span>`).join("")}</div>`).join("")}</div>`;
  if (type === "donut" || type === "gauge") return `<div class="donut"><strong>76%</strong></div>`;
  if (type === "timeline") return `<div class="timeline">${chartData.map(d=>`<div><b>${d.label}</b><p>Hito demo con avance ${d.value}%</p></div>`).join("")}</div>`;
  if (type === "horizontal-bar") return chartData.map(d=>`<p>${d.label}</p><div class="hbar" style="width:${d.value}%"></div>`).join("");
  return `<div class="chart-bars">${chartData.map(d=>`<div class="bar" style="height:${d.value}%"></div>`).join("")}</div>`;
}
function renderVisuals() {
  $("visuals").innerHTML = TEMPLATE.charts.slice(0, 2).map(type => `<article class="viz-card"><h2>${type.replaceAll("-", " ")}</h2>${renderVisual(type)}</article>`).join("");
}
function renderTable(rows) {
  const filtered = rows.filter(row => !filterInput.value || JSON.stringify(row).toLowerCase().includes(filterInput.value.toLowerCase()));
  $("tableWrap").innerHTML = `<table><thead><tr><th>Item</th><th>Area</th><th>Valor</th><th>Estado</th><th>Responsable</th></tr></thead><tbody>${filtered.map(row=>`<tr><td>${row.item}</td><td>${row.area}</td><td>${row.value}</td><td><span class="pill">${row.status}</span></td><td>${row.owner}</td></tr>`).join("")}</tbody></table>`;
}
function renderInsights() {
  $("insights").innerHTML = TEMPLATE.insights.slice(0, 4).map(text => `<div class="insight"><b>${text}</b><p>Insight ficticio para evaluar decisiones y acciones del template.</p></div>`).join("");
}
async function init() {
  show("loading", true);
  $("updatedAt").textContent = new Date().toLocaleDateString("es-AR");
  const sdk = window.dashboardManager;
  if (!sdk) show("notice", true), $("notice").textContent = "Modo demo: SDK no disponible.";
  const stateKey = TEMPLATE.editableStateKeys[0] || "comentarios";
  $("editableTitle").textContent = `Comentarios y acciones - ${stateKey}`;
  $("saveButton").addEventListener("click", async () => {
    const value = $("commentInput").value.trim();
    if (!value) return;
    if (sdk?.setState) await sdk.setState(stateKey, { value, updatedAt: new Date().toISOString() });
    $("saveStatus").textContent = "Guardado en estado editable demo.";
  });
  filterInput.addEventListener("input", () => renderTable(demoRows));
  renderKpis(); renderVisuals(); renderInsights(); renderTable(demoRows);
  show("loading", false); show("content", true);
}
init().catch(error => { console.error(error); show("loading", false); show("error", true); });


