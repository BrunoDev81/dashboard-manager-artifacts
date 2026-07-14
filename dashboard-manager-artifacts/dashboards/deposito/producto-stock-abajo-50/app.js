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

function columnName(column) {
  if (typeof column === "string") return column;
  if (!column || typeof column !== "object") return "";
  return column.name || column.field || column.column_name || column.column || "";
}

function rowsWithColumns(rows, columns) {
  if (!Array.isArray(rows) || !rows.length || !Array.isArray(rows[0]) || !Array.isArray(columns)) {
    return Array.isArray(rows) ? rows : [];
  }

  const names = columns.map(columnName);
  return rows.map((values) => Object.fromEntries(
    names.map((name, index) => [name, values[index]])
  ));
}

function extractRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const columns = payload.columns || payload.fields || payload.headers || payload.columnNames;
  const candidates = [
    payload.rows,
    payload.data,
    payload.items,
    payload.records,
    payload.results,
    payload.result
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const rows = rowsWithColumns(candidate, columns);
      if (rows.length) return rows;
    }
    if (candidate && typeof candidate === "object") {
      const nested = extractRows(candidate);
      if (nested.length) return nested;
    }
  }

  return [];
}

function getField(row, fieldName) {
  if (!row || typeof row !== "object") return undefined;
  if (Object.prototype.hasOwnProperty.call(row, fieldName)) return row[fieldName];

  const normalizeKey = (key) => String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
  const wanted = normalizeKey(fieldName);
  const matchingKey = Object.keys(row).find((key) => normalizeKey(key) === wanted);
  return matchingKey ? row[matchingKey] : undefined;
}

function unwrapValue(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return value.value ?? value.raw ?? value.numericValue ?? value.amount ?? value.data ?? value;
}

function toNumber(value) {
  const unwrapped = unwrapValue(value);
  if (typeof unwrapped === "number") return Number.isFinite(unwrapped) ? unwrapped : 0;
  if (unwrapped === null || unwrapped === undefined || unwrapped === "") return 0;

  const compact = String(unwrapped).trim().replace(/\s/g, "");
  const direct = Number(compact);
  if (Number.isFinite(direct)) return direct;

  const normalized = compact
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanText(value, fallback = "Sin dato") {
  const text = value === null || value === undefined ? "" : String(value).trim();
  return text || fallback;
}

function getFirstField(row, fieldNames) {
  for (const fieldName of fieldNames) {
    const value = getField(row, fieldName);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function normalizeProduct(row) {
  return {
    id: cleanText(getFirstField(row, ["producto_id", "productoId", "codigo_producto"])),
    name: cleanText(getFirstField(row, ["producto", "product"])),
    volumeMaterial: cleanText(getFirstField(row, ["volumen_material", "volume_material"])),
    materialClass: cleanText(getFirstField(row, ["clase_material", "material_class"])),
    group: cleanText(getFirstField(row, ["grupo", "group"])),
    division: cleanText(getFirstField(row, ["division", "division_name"])),
    brand: cleanText(getFirstField(row, ["marca", "brand"])),
    depositStock: toNumber(getFirstField(row, [
      "und_stock_deposito",
      "undStockDeposito",
      "stock_deposito",
      "stockDeposito",
      "estoque_deposito"
    ])),
    transitStock: toNumber(getFirstField(row, [
      "und_stock_transito",
      "undStockTransito",
      "stock_transito",
      "stockTransito",
      "estoque_transito"
    ])),
    depositVolume: toNumber(getFirstField(row, ["vol_stock_deposito", "volStockDeposito"])),
    transitVolume: toNumber(getFirstField(row, ["vol_stock_transito", "volStockTransito"]))
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
  const ranked = products
    .filter((product) => product.depositStock > 0)
    .slice(0, 8);

  if (!ranked.length) {
    const empty = document.createElement("p");
    empty.className = "ranking-empty";
    empty.textContent = "No hay productos con stock positivo en la selección actual.";
    fragment.appendChild(empty);
    elements.ranking.replaceChildren(fragment);
    return;
  }

  const max = Math.max(...ranked.map((product) => product.depositStock), 1);

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
    const isZeroStock = product.depositStock <= 0;
    bar.className = "rank-bar" + (isZeroStock ? " zero" : "");
    bar.title = isZeroStock ? "Sin stock" : numberFormatter.format(product.depositStock) + " unidades";
    bar.style.width = isZeroStock
      ? "8px"
      : Math.max((Math.max(product.depositStock, 0) / max) * 100, 2) + "%";
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

async function loadDatasetRows() {
  const pageSize = 5000;
  const firstPage = await window.DashboardManager.getDataset(DATASET_NAME, {
    page: 1,
    pageSize
  });
  const rows = extractRows(firstPage);
  const total = Number(firstPage?.total || firstPage?.totalCount || 0);
  const pages = total > rows.length ? Math.ceil(total / pageSize) : 1;

  for (let page = 2; page <= pages; page += 1) {
    const nextPage = await window.DashboardManager.getDataset(DATASET_NAME, {
      page,
      pageSize
    });
    rows.push(...extractRows(nextPage));
  }

  return rows;
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
    const rows = await loadDatasetRows();

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
