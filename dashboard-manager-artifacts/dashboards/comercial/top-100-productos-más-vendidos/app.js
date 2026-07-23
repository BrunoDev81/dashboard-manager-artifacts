(function () {
  "use strict";

  const REPORT_YEAR = 2026;
  const CONTRACT = Object.freeze({
    datasets: Object.freeze({ catalog: "productos_catalogo", orders: "pedidos" }),
    editableStateKeys: Object.freeze(["comentarios", "acciones", "metas"])
  });

  const model = {
    ranking: [],
    annualLiters: 0,
    annualProducts: 0,
    sort: { field: "litros", direction: "desc" },
    quality: null
  };

  const numberFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
  const decimalFormat = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const dateTimeFormat = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });

  function byId(id) {
    return document.getElementById(id);
  }

  function sdk() {
    return window.DashboardManager || null;
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[character];
    });
  }

  function normalizeText(value) {
    return String(value === undefined || value === null ? "" : value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("es-AR");
  }

  function displayText(value, fallback) {
    const text = String(value === undefined || value === null ? "" : value).replace(/\s+/g, " ").trim();
    return text || fallback;
  }

  function parseNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (value === undefined || value === null || value === "") return null;
    let text = String(value).trim().replace(/\s/g, "");
    if (!text) return null;
    const lastComma = text.lastIndexOf(",");
    const lastDot = text.lastIndexOf(".");
    if (lastComma > lastDot) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else if (lastDot > lastComma && lastComma >= 0) {
      text = text.replace(/,/g, "");
    } else if (lastComma >= 0) {
      text = text.replace(",", ".");
    }
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function parseYear(row) {
    const sourceYear = Number.parseInt(row && row.source_year, 10);
    if (Number.isFinite(sourceYear)) return sourceYear;
    const rawDate = String(row && row.fecha_id !== undefined ? row.fecha_id : "").trim();
    const match = rawDate.match(/(?:^|\D)(20\d{2})(?:\D|$)/);
    if (match) return Number.parseInt(match[1], 10);
    if (/^\d{8}$/.test(rawDate)) return Number.parseInt(rawDate.slice(0, 4), 10);
    return null;
  }

  function unwrapRows(result, datasetName) {
    if (Array.isArray(result)) return result;
    const candidates = [
      result && result.rows,
      result && result.data,
      result && result.items,
      result && result.records,
      result && result.payload,
      result && result.data && result.data.rows,
      result && result.data && result.data.items,
      result && result.payload && result.payload.rows,
      result && result.payload && result.payload.items,
      result && result.result && result.result.rows,
      result && result.result && result.result.data,
      result && result.dataset && result.dataset.rows
    ];
    const rows = candidates.find(Array.isArray);
    if (rows) return rows;
    throw new Error("El dataset " + datasetName + " respondió con un formato no reconocido.");
  }

  async function getAllRows(datasetName) {
    const manager = sdk();
    if (!manager || typeof manager.getDataset !== "function") {
      throw new Error("Dashboard Manager SDK no está disponible en este entorno.");
    }
    return unwrapRows(await manager.getDataset(datasetName), datasetName);
  }

  function buildCatalogIndex(rows) {
    const index = new Map();
    let missingProduct = 0;
    rows.forEach(function (row) {
      const key = normalizeText(row && row.producto);
      if (!key) {
        missingProduct += 1;
        return;
      }
      if (!index.has(key)) index.set(key, { rows: 0, rubros: new Set() });
      const entry = index.get(key);
      entry.rows += 1;
      const rubro = displayText(row.rubro, "");
      if (rubro) entry.rubros.add(rubro);
    });
    return { index: index, missingProduct: missingProduct };
  }

  function aggregateOrders(rows) {
    const groups = new Map();
    const quality = {
      orderRows: rows.length,
      rowsInYear: 0,
      invalidPeriod: 0,
      invalidLiters: 0,
      missingProduct: 0
    };

    rows.forEach(function (row) {
      const year = parseYear(row);
      if (year === null) {
        quality.invalidPeriod += 1;
        return;
      }
      if (year !== REPORT_YEAR) return;
      quality.rowsInYear += 1;

      const liters = parseNumber(row.litros_pedidos);
      if (liters === null) {
        quality.invalidLiters += 1;
        return;
      }
      const key = normalizeText(row.producto);
      if (!key) {
        quality.missingProduct += 1;
        return;
      }
      if (!groups.has(key)) {
        groups.set(key, {
          key: key,
          producto: displayText(row.producto, "Producto sin nombre"),
          litros: 0
        });
      }
      groups.get(key).litros += liters;
    });

    return { groups: Array.from(groups.values()), quality: quality };
  }

  function joinCatalog(groups, catalog) {
    let missingMatch = 0;
    let ambiguous = 0;
    let duplicatedCatalog = 0;
    const enriched = groups.map(function (group) {
      const match = catalog.index.get(group.key);
      let rubro = "Sin asignar";
      if (!match) {
        missingMatch += 1;
      } else {
        if (match.rows > 1) duplicatedCatalog += 1;
        if (match.rubros.size === 1) rubro = Array.from(match.rubros)[0];
        if (match.rubros.size > 1) ambiguous += 1;
      }
      return {
        producto: group.producto,
        rubro: rubro,
        litros: group.litros,
        fechaId: String(REPORT_YEAR)
      };
    });
    return {
      rows: enriched,
      quality: {
        missingMatch: missingMatch,
        ambiguous: ambiguous,
        duplicatedCatalog: duplicatedCatalog,
        catalogMissingProduct: catalog.missingProduct
      }
    };
  }

  function prepareModel(orderRows, catalogRows) {
    const aggregated = aggregateOrders(orderRows);
    const catalog = buildCatalogIndex(catalogRows);
    const joined = joinCatalog(aggregated.groups, catalog);
    const allProducts = joined.rows.sort(function (a, b) {
      return b.litros - a.litros || a.producto.localeCompare(b.producto, "es-AR");
    });
    const annualLiters = allProducts.reduce(function (sum, row) { return sum + row.litros; }, 0);
    const ranking = allProducts.slice(0, 100).map(function (row, index) {
      return Object.assign({}, row, {
        posicion: index + 1,
        participacion: annualLiters ? row.litros / annualLiters * 100 : 0
      });
    });

    model.ranking = ranking;
    model.annualLiters = annualLiters;
    model.annualProducts = allProducts.length;
    model.quality = Object.assign({}, aggregated.quality, joined.quality, {
      catalogRows: catalogRows.length,
      aggregatedProducts: allProducts.length
    });
  }

  function kpiCard(label, value, caption, status, tone, productValue) {
    return '<article class="kpi-card" data-tone="' + escapeHtml(tone) + '">' +
      '<span class="kpi-label">' + escapeHtml(label) + '</span>' +
      '<strong class="kpi-value' + (productValue ? ' product-value' : '') + '">' + escapeHtml(value) + '</strong>' +
      '<span class="kpi-caption">' + escapeHtml(caption) + '</span>' +
      '<span class="kpi-status">' + escapeHtml(status) + '</span>' +
      '</article>';
  }

  function renderKpis() {
    const leader = model.ranking[0];
    const topTenLiters = model.ranking.slice(0, 10).reduce(function (sum, row) { return sum + row.litros; }, 0);
    const topTenShare = model.annualLiters ? topTenLiters / model.annualLiters * 100 : 0;
    byId("kpiGrid").innerHTML = [
      kpiCard("Litros pedidos", numberFormat.format(model.annualLiters) + " L", "Total válido del período 2026", "Volumen anual", "default", false),
      kpiCard("Productos con pedidos", numberFormat.format(model.annualProducts), "Productos únicos con volumen válido", "Cobertura anual", "default", false),
      kpiCard("Producto líder", leader.producto, numberFormat.format(leader.litros) + " litros pedidos", "Posición 1", "positive", true),
      kpiCard("Concentración Top 10", decimalFormat.format(topTenShare) + "%", "Participación sobre el volumen anual", "Lectura 80/20", "default", false)
    ].join("");
  }

  function sortedRows(rows) {
    const field = model.sort.field;
    const multiplier = model.sort.direction === "asc" ? 1 : -1;
    return rows.slice().sort(function (a, b) {
      if (field === "producto" || field === "rubro") {
        return a[field].localeCompare(b[field], "es-AR") * multiplier;
      }
      return ((a[field] || 0) - (b[field] || 0)) * multiplier;
    });
  }

  function filteredRows() {
    const query = normalizeText(byId("tableSearch").value);
    const rows = model.ranking.filter(function (row) {
      return !query || normalizeText(row.producto + " " + row.rubro).includes(query);
    });
    return sortedRows(rows);
  }

  function updateSortButtons() {
    document.querySelectorAll(".sort-button").forEach(function (button) {
      const active = button.dataset.sort === model.sort.field;
      button.setAttribute("aria-pressed", active ? "true" : "false");
      const icon = button.querySelector("span");
      if (icon) icon.textContent = active ? (model.sort.direction === "asc" ? "↑" : "↓") : "↕";
    });
  }

  function renderTable() {
    const rows = filteredRows();
    const hasRows = rows.length > 0;
    byId("searchEmpty").classList.toggle("hidden", hasRows);
    byId("tableWrap").classList.toggle("hidden", !hasRows);
    byId("visibleCount").textContent = rows.length + (rows.length === 1 ? " producto" : " productos");
    byId("tableBody").innerHTML = rows.map(function (row) {
      const width = Math.min(100, Math.max(2, row.participacion * 3));
      return "<tr>" +
        '<td class="rank-cell"><span class="rank-badge' + (row.posicion <= 3 ? " top-three" : "") + '">' + row.posicion + "</span></td>" +
        '<td class="product-cell">' + escapeHtml(row.producto) + "</td>" +
        '<td class="rubro-cell">' + escapeHtml(row.rubro) + "</td>" +
        "<td>" + escapeHtml(row.fechaId) + "</td>" +
        '<td class="numeric">' + escapeHtml(numberFormat.format(row.litros)) + " L</td>" +
        '<td class="numeric share-cell"><span class="share-value">' + escapeHtml(decimalFormat.format(row.participacion)) + '%</span><span class="share-track"><span class="share-fill" style="width:' + width.toFixed(1) + '%"></span></span></td>' +
        "</tr>";
    }).join("");
    updateSortButtons();
  }

  function renderTraceability() {
    const q = model.quality;
    const cautions = q.invalidPeriod + q.invalidLiters + q.missingProduct + q.missingMatch + q.ambiguous;
    byId("traceSummary").textContent = cautions
      ? "El ranking conserva los pedidos válidos y señala las excepciones sin inventar relaciones de catálogo."
      : "El período y el cruce de productos no presentan excepciones en los registros procesados.";
    const items = [
      numberFormat.format(q.orderRows) + " pedidos procesados",
      numberFormat.format(q.rowsInYear) + " pedidos de 2026",
      numberFormat.format(q.catalogRows) + " filas de catálogo",
      numberFormat.format(q.invalidPeriod) + " períodos inválidos",
      numberFormat.format(q.invalidLiters) + " litros inválidos",
      numberFormat.format(q.missingProduct) + " pedidos sin producto",
      numberFormat.format(q.missingMatch) + " productos sin catálogo",
      numberFormat.format(q.ambiguous) + " rubros ambiguos",
      numberFormat.format(q.duplicatedCatalog) + " productos duplicados en catálogo"
    ];
    byId("traceList").innerHTML = items.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("");
  }

  function renderDashboard() {
    renderKpis();
    renderTable();
    renderTraceability();
    byId("tableSummary").textContent = "Top " + model.ranking.length + " de " + numberFormat.format(model.annualProducts) + " productos con pedidos válidos en 2026.";
    byId("updatedAt").textContent = "Actualizado " + dateTimeFormat.format(new Date());
    byId("connectionStatus").textContent = "Información actualizada";
  }

  function showState(state) {
    ["loadingState", "errorState", "emptyState", "dashboardContent"].forEach(function (id) {
      byId(id).classList.add("hidden");
    });
    byId(state).classList.remove("hidden");
  }

  async function initialize() {
    showState("loadingState");
    byId("connectionStatus").textContent = "Preparando información";
    byId("updatedAt").textContent = "Actualización pendiente";
    try {
      const results = await Promise.all([
        getAllRows(CONTRACT.datasets.orders),
        getAllRows(CONTRACT.datasets.catalog)
      ]);
      prepareModel(results[0], results[1]);
      if (!model.ranking.length) {
        byId("connectionStatus").textContent = "Sin datos para 2026";
        byId("updatedAt").textContent = "Consulta completada";
        showState("emptyState");
        return;
      }
      renderDashboard();
      showState("dashboardContent");
    } catch (error) {
      byId("errorMessage").textContent = error && error.message
        ? error.message
        : "Ocurrió un error inesperado. Reintentá la operación.";
      byId("connectionStatus").textContent = "Información no disponible";
      byId("updatedAt").textContent = "Carga interrumpida";
      showState("errorState");
    }
  }

  function bindEvents() {
    byId("retryButton").addEventListener("click", initialize);
    byId("tableSearch").addEventListener("input", renderTable);
    document.querySelectorAll(".sort-button").forEach(function (button) {
      button.addEventListener("click", function () {
        const field = button.dataset.sort;
        if (model.sort.field === field) {
          model.sort.direction = model.sort.direction === "asc" ? "desc" : "asc";
        } else {
          model.sort.field = field;
          model.sort.direction = field === "producto" || field === "rubro" ? "asc" : "desc";
        }
        renderTable();
      });
    });
  }

  bindEvents();
  initialize();
}());
