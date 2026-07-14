"use strict";

const DATASET_NAME = "dim_producto";
const STOCK_LIMIT = 50;
const TABLE_LIMIT = 100;

const state = {
  products: [],
  filtered: []
};

const elements = {
  feedback: document.getElementById("feedback"),
  feedbackTitle: document.getElementById("feedbackTitle"),
  feedbackMessage: document.getElementById("feedbackMessage"),
  content: document.getElementById("dashboardContent"),
  updatedAt: document.getElementById("updatedAt"),
  search: document.getElementById("searchInput"),
  brand: document.getElementById("brandFilter"),
  group: document.getElementById("groupFilter"),
  status: document.getElementById("statusFilter"),
  clear: document.getElementById("clearFilters"),
  rows: document.getElementById("productRows"),
  ranking: document.getElementById("ranking"),
  resultCount: document.getElementById("resultCount"),
  tableNote: document.getElementById("tableNote"),
  kpiProducts: document.getElementById("kpiProducts"),
  kpiNoStock: document.getElementById("kpiNoStock"),
  kpiCritical: document.getElementById("kpiCritical"),
  kpiTransit: document.getElementById("kpiTransit"),
  riskNoStock: document.getElementById("riskNoStock"),
  riskCritical: document.getElementById("riskCritical"),
  riskLow: document.getElementById("riskLow"),
  riskWatch: document.getElementById("riskWatch")
};

const numberFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 2
});

function extractRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.rows,
    payload.data,
    payload.items,
    payload.records,
    payload.results,
    payload.result
  ];

  return candidates.find(Array.isArray) || [];
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined || value === "") return 0;

  const normalized = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanText(value, fallback = "Sin dato") {
  const text = value === null || value === undefined ? "" : String(value).trim();
  return text || fallback;
}

function normalizeProduct(row) {
  return {
    id: cleanText(row.producto_id),
    name: cleanText(row.producto),
    volumeMaterial: cleanText(row.volumen_material),
    materialClass: cleanText(row.clase_material),
    group: cleanText(row.grupo),
    division: cleanText(row.division),
    brand: cleanText(row.marca),
    depositStock: toNumber(row.und_stock_deposito),
    transitStock: toNumber(row.und_stock_transito),
    depositVolume: toNumber(row.vol_stock_deposito),
    transitVolume: toNumber(row.vol_stock_transito)
  };
}

function stockStatus(stock) {
  if (stock <= 0) return { key: "sin-stock", label: "Sin stock" };
  if (stock <= 10) return { key: "critico", label: "Crítico" };
  if (stock <= 25) return { key: "bajo", label: "Bajo" };
  return { key: "atencion", label: "Atención" };
}

function setFeedback(type, title, message) {
  elements.feedback.className = "feedback card" + (type ? " " + type : "");
  elements.feedbackTitle.textContent = title;
  elements.feedbackMessage.textContent = message;
  elements.feedback.hidden = false;
  elements.content.hidden = true;
}

function setSelectOptions(select, values) {
  const initialLabel = select.id === "brandFilter" ? "Todas" : "Todos";
  select.replaceChildren(new Option(initialLabel, ""));
  values.forEach((value) => select.add(new Option(value, value)));
}

function uniqueSorted(key) {
  return [...new Set(state.products.map((product) => product[key]))]
    .filter((value) => value !== "Sin dato")
    .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

function matchesFilters(product) {
  const query = elements.search.value.trim().toLocaleLowerCase("es");
  const haystack = (product.id + " " + product.name).toLocaleLowerCase("es");
  const status = stockStatus(product.depositStock).key;

  return (!query || haystack.includes(query))
    && (!elements.brand.value || product.brand === elements.brand.value)
    && (!elements.group.value || product.group === elements.group.value)
    && (!elements.status.value || status === elements.status.value);
}

function createCell(value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = value;
  if (className) cell.className = className;
  return cell;
}

function renderTable(products) {
  const fragment = document.createDocumentFragment();
  const visible = products.slice(0, TABLE_LIMIT);

  visible.forEach((product) => {
    const row = document.createElement("tr");
    const status = stockStatus(product.depositStock);

    row.append(
      createCell(product.id),
      createCell(product.name, "product-name"),
      createCell(product.brand),
      createCell(product.group),
      createCell(product.materialClass),
      createCell(numberFormatter.format(product.depositStock), "numeric"),
      createCell(numberFormatter.format(product.transitStock), "numeric")
    );

    const statusCell = document.createElement("td");
    const pill = document.createElement("span");
    pill.className = "status-pill " + status.key;
    pill.textContent = status.label;
    statusCell.appendChild(pill);
    row.appendChild(statusCell);
    fragment.appendChild(row);
  });

  elements.rows.replaceChildren(fragment);
  elements.resultCount.textContent = products.length === 1
    ? "1 resultado"
    : numberFormatter.format(products.length) + " resultados";
  elements.tableNote.textContent = products.length > TABLE_LIMIT
    ? "Se muestran los primeros " + TABLE_LIMIT + " productos, ordenados de menor a mayor stock."
    : "Productos ordenados de menor a mayor stock de depósito.";
}

function renderRanking(products) {
  const fragment = document.createDocumentFragment();
  const ranked = products.slice(0, 8);
  const max = Math.max(...ranked.map((product) => Math.max(product.depositStock, 0)), 1);

  ranked.forEach((product) => {
    const row = document.createElement("div");
    row.className = "rank-row";

    const label = document.createElement("span");
    label.className = "rank-label";
    label.title = product.name;
    label.textContent = product.name;

    const track = document.createElement("span");
    track.className = "rank-track";
    const bar = document.createElement("span");
    bar.className = "rank-bar";
    bar.style.width = Math.max((Math.max(product.depositStock, 0) / max) * 100, 2) + "%";
    track.appendChild(bar);

    const value = document.createElement("span");
    value.className = "rank-value";
    value.textContent = numberFormatter.format(product.depositStock);

    row.append(label, track, value);
    fragment.appendChild(row);
  });

  elements.ranking.replaceChildren(fragment);
}

function renderMetrics(products) {
  const counts = {
    noStock: 0,
    critical: 0,
    low: 0,
    watch: 0
  };
  let transit = 0;

  products.forEach((product) => {
    const status = stockStatus(product.depositStock).key;
    transit += product.transitStock;
    if (status === "sin-stock") counts.noStock += 1;
    if (status === "critico") counts.critical += 1;
    if (status === "bajo") counts.low += 1;
    if (status === "atencion") counts.watch += 1;
  });

  elements.kpiProducts.textContent = numberFormatter.format(products.length);
  elements.kpiNoStock.textContent = numberFormatter.format(counts.noStock);
  elements.kpiCritical.textContent = numberFormatter.format(counts.critical);
  elements.kpiTransit.textContent = numberFormatter.format(transit);
  elements.riskNoStock.textContent = numberFormatter.format(counts.noStock);
  elements.riskCritical.textContent = numberFormatter.format(counts.critical);
  elements.riskLow.textContent = numberFormatter.format(counts.low);
  elements.riskWatch.textContent = numberFormatter.format(counts.watch);
}

function applyFilters() {
  state.filtered = state.products
    .filter(matchesFilters)
    .sort((a, b) => a.depositStock - b.depositStock || a.name.localeCompare(b.name, "es"));

  if (!state.filtered.length) {
    setFeedback(
      "empty",
      "No hay productos para mostrar",
      "Probá limpiar o cambiar los filtros seleccionados."
    );
    return;
  }

  elements.feedback.hidden = true;
  elements.content.hidden = false;
  renderMetrics(state.filtered);
  renderRanking(state.filtered);
  renderTable(state.filtered);
}

function clearFilters() {
  elements.search.value = "";
  elements.brand.value = "";
  elements.group.value = "";
  elements.status.value = "";
  applyFilters();
}

async function loadDashboard() {
  if (!window.DashboardManager || typeof window.DashboardManager.getDataset !== "function") {
    setFeedback(
      "error",
      "No se pudo iniciar el dashboard",
      "La integración con Dashboard Manager no está disponible en esta vista."
    );
    elements.updatedAt.textContent = "Integración no disponible";
    return;
  }

  try {
    const payload = await window.DashboardManager.getDataset(DATASET_NAME, {});
    const rows = extractRows(payload);

    state.products = rows
      .map(normalizeProduct)
      .filter((product) => product.depositStock <= STOCK_LIMIT);

    setSelectOptions(elements.brand, uniqueSorted("brand"));
    setSelectOptions(elements.group, uniqueSorted("group"));

    elements.updatedAt.textContent = "Actualizado " + new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());

    if (!state.products.length) {
      setFeedback(
        "empty",
        "No hay productos con stock de hasta 50",
        "El dataset respondió correctamente, pero no contiene registros dentro del criterio de hasta 50 unidades."
      );
      return;
    }

    applyFilters();
  } catch (error) {
    console.error("No fue posible cargar dim_producto.", error);
    setFeedback(
      "error",
      "No pudimos cargar los productos",
      "Reintentá más tarde o verificá la disponibilidad del dataset autorizado."
    );
    elements.updatedAt.textContent = "Error de actualización";
  }
}

elements.search.addEventListener("input", applyFilters);
elements.brand.addEventListener("change", applyFilters);
elements.group.addEventListener("change", applyFilters);
elements.status.addEventListener("change", applyFilters);
elements.clear.addEventListener("click", clearFilters);

loadDashboard();
