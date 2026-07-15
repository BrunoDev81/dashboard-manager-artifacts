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
  groupDonut: document.getElementById("groupDonut"),
  groupLegend: document.getElementById("groupLegend"),
  goalWidgets: document.getElementById("goalWidgets"),
  accumulatedArea: document.getElementById("accumulatedArea"),
  areaNote: document.getElementById("areaNote"),
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
    date: getFirstField(row, ["fecha", "date", "updated_at", "updatedAt", "fecha_actualizacion"]),
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
    transitVolume: toNumber(getFirstField(row, ["vol_stock_transito", "volStockTransito"])),
    areaValue: toNumber(getFirstField(row, ["und_stock_deposito", "stock_deposito", "stockDeposito"])),
    areaSeries: cleanText(getFirstField(row, ["grupo", "group"]), "Sin serie")
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

const WIDGET_COLORS = ["#0072bc", "#00a6df", "#009a44", "#f3b51b", "#c43e4b"];

function createSvgElement(name, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function renderDonut(products) {
  const counts = new Map();
  products.forEach((product) => {
    const group = product.group === "Sin dato" ? "Sin grupo" : product.group;
    counts.set(group, (counts.get(group) || 0) + 1);
  });

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 4);
  const remainder = sorted.slice(4).reduce((sum, entry) => sum + entry[1], 0);
  if (remainder) top.push(["Otros", remainder]);

  const total = products.length || 1;
  const svg = createSvgElement("svg", {
    class: "donut-svg",
    viewBox: "0 0 120 120",
    role: "img",
    "aria-label": "Participación de productos por grupo"
  });
  svg.appendChild(createSvgElement("circle", {
    cx: 60, cy: 60, r: 42, fill: "none", stroke: "#eef7ff", "stroke-width": 16
  }));

  let offset = 0;
  top.forEach(([label, count], index) => {
    const length = (count / total) * 263.89;
    svg.appendChild(createSvgElement("circle", {
      cx: 60, cy: 60, r: 42, fill: "none",
      stroke: WIDGET_COLORS[index % WIDGET_COLORS.length],
      "stroke-width": 16,
      "stroke-dasharray": length + " " + (263.89 - length),
      "stroke-dashoffset": -offset,
      transform: "rotate(-90 60 60)"
    }));
    offset += length;
  });

  const centerValue = createSvgElement("text", { x: 60, y: 58, class: "donut-center-value" });
  centerValue.textContent = numberFormatter.format(products.length);
  const centerLabel = createSvgElement("text", { x: 60, y: 69, class: "donut-center-label" });
  centerLabel.textContent = "productos";
  svg.append(centerValue, centerLabel);
  elements.groupDonut.replaceChildren(svg);

  const legend = document.createDocumentFragment();
  top.forEach(([label, count], index) => {
    const row = document.createElement("div");
    row.className = "legend-row";
    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.backgroundColor = WIDGET_COLORS[index % WIDGET_COLORS.length];
    const name = document.createElement("span");
    name.textContent = label;
    const value = document.createElement("span");
    value.className = "legend-value";
    value.textContent = numberFormatter.format((count / total) * 100) + "%";
    row.append(dot, name, value);
    legend.appendChild(row);
  });
  elements.groupLegend.replaceChildren(legend);
}

function createGoalWidget(title, current, target, suffix, alert) {
  const item = document.createElement("div");
  item.className = "goal-item";
  const head = document.createElement("div");
  head.className = "goal-head";
  const label = document.createElement("span");
  label.textContent = title;
  const currentValue = document.createElement("strong");
  currentValue.className = "goal-current";
  currentValue.textContent = numberFormatter.format(current) + " " + suffix;
  head.append(label, currentValue);

  const track = document.createElement("div");
  track.className = "goal-track";
  const fill = document.createElement("div");
  fill.className = "goal-fill" + (alert ? " alert" : "");
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : (current === 0 ? 100 : 4);
  fill.style.width = progress + "%";
  track.appendChild(fill);

  const meta = document.createElement("div");
  meta.className = "goal-meta";
  const range = document.createElement("span");
  range.textContent = "Rango 0–" + numberFormatter.format(target);
  const goal = document.createElement("span");
  goal.textContent = "Meta: " + numberFormatter.format(target);
  meta.append(range, goal);
  item.append(head, track, meta);
  return item;
}

function renderGoals(products) {
  const positive = products.filter((product) => product.depositStock > 0).length;
  const noStock = products.filter((product) => product.depositStock <= 0).length;
  elements.goalWidgets.replaceChildren(
    createGoalWidget("Cobertura con stock", positive, products.length, "productos", false),
    createGoalWidget("Productos sin stock", noStock, 0, "productos", true)
  );
}

function renderAccumulatedArea(products) {
  const dated = products
    .map((product) => {
      const parsed = product.date ? new Date(product.date) : null;
      return parsed && !Number.isNaN(parsed.getTime())
        ? { product, date: parsed.toISOString().slice(0, 10) }
        : null;
    })
    .filter(Boolean);

  if (!dated.length) {
    elements.accumulatedArea.replaceChildren(Object.assign(document.createElement("p"), {
      className: "area-empty",
      textContent: "No hay fechas autorizadas para construir una serie acumulada."
    }));
    elements.areaNote.textContent = "Se requieren Fecha, valor y serie en el dataset autorizado.";
    return;
  }

  const dates = [...new Set(dated.map((item) => item.date))].sort();
  const series = [...new Set(dated.map((item) => item.product.areaSeries))];
  const colors = ["#0072bc", "#00a6df", "#009a44", "#f3b51b", "#c43e4b"];
  const width = 640;
  const height = 190;
  const left = 36;
  const right = 14;
  const top = 16;
  const bottom = 28;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const totals = new Map();
  dated.forEach(({ product, date }) => {
    const key = date + "|" + product.areaSeries;
    totals.set(key, (totals.get(key) || 0) + product.areaValue);
  });

  const cumulative = series.map((name) => {
    let running = 0;
    return dates.map((date) => {
      running += totals.get(date + "|" + name) || 0;
      return running;
    });
  });
  const maxValue = Math.max(...cumulative.flat(), 1);
  const svg = createSvgElement("svg", {
    class: "area-svg",
    viewBox: "0 0 " + width + " " + height,
    role: "img",
    "aria-label": "Área acumulada por fecha y serie"
  });

  [0, 0.5, 1].forEach((ratio) => {
    const y = top + chartHeight * (1 - ratio);
    svg.appendChild(createSvgElement("line", {
      x1: left, y1: y, x2: width - right, y2: y, class: "area-grid-line"
    }));
    const label = createSvgElement("text", { x: 4, y: y + 4, class: "area-axis-label" });
    label.textContent = numberFormatter.format(maxValue * ratio);
    svg.appendChild(label);
  });

  series.forEach((name, seriesIndex) => {
    const values = cumulative[seriesIndex];
    const points = values.map((value, index) => {
      const x = dates.length === 1 ? left + chartWidth / 2 : left + (index / (dates.length - 1)) * chartWidth;
      const y = top + chartHeight - (value / maxValue) * chartHeight;
      return { x, y };
    });
    const linePoints = points.map((point) => point.x + "," + point.y).join(" ");
    const first = points[0];
    const last = points[points.length - 1];
    const fillPoints = first.x + "," + (top + chartHeight) + " " + linePoints + " " + last.x + "," + (top + chartHeight);
    const color = colors[seriesIndex % colors.length];
    svg.appendChild(createSvgElement("polygon", {
      points: fillPoints,
      fill: color,
      class: "area-path"
    }));
    svg.appendChild(createSvgElement("polyline", {
      points: linePoints,
      fill: "none",
      stroke: color,
      class: "area-path"
    }));
  });

  dates.forEach((date, index) => {
    const x = dates.length === 1 ? left + chartWidth / 2 : left + (index / (dates.length - 1)) * chartWidth;
    const label = createSvgElement("text", {
      x, y: height - 8, class: "area-axis-label", "text-anchor": "middle"
    });
    label.textContent = date;
    svg.appendChild(label);
  });

  const legend = document.createElement("div");
  legend.className = "area-legend";
  series.forEach((name, index) => {
    const item = document.createElement("span");
    item.className = "area-legend-item";
    const dot = document.createElement("span");
    dot.className = "area-legend-dot";
    dot.style.backgroundColor = colors[index % colors.length];
    const label = document.createElement("span");
    label.textContent = name;
    item.append(dot, label);
    legend.appendChild(item);
  });
  elements.accumulatedArea.replaceChildren(svg, legend);
  elements.areaNote.textContent = "Acumulado por Fecha, usando valor de stock de depósito y serie Grupo.";
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
  renderDonut(state.filtered);
  renderGoals(state.filtered);
  renderAccumulatedArea(state.filtered);
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
