(function () {
  "use strict";

  const PREFERRED_YEAR = 2026;
  let reportYear = PREFERRED_YEAR;
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

  function unwrapAggregateItems(result, datasetName) {
    if (Array.isArray(result)) return result;
    const candidates = [
      result && result.items,
      result && result.data && result.data.items,
      result && result.payload && result.payload.items,
      result && result.result && result.result.items
    ];
    const items = candidates.find(Array.isArray);
    if (items) return items;
    throw new Error("La agregación de " + datasetName + " respondió con un formato no reconocido.");
  }

  async function aggregateRows(datasetName, request) {
    const manager = sdk();
    if (!manager || typeof manager.aggregateDataset !== "function") {
      throw new Error("Dashboard Manager SDK no está disponible en este entorno.");
    }
    return unwrapAggregateItems(await manager.aggregateDataset(datasetName, request), datasetName);
  }

  function yearFilter() {
    return [{ column: "source_year", operator: "EQ", value: String(reportYear) }];
  }

  function periodsRequest() {
    return {
      groupBy: ["source_year"],
      aggregations: [
        { column: "litros_pedidos", operation: "SUM", alias: "total_litros" }
      ],
      filters: [],
      sortBy: "source_year",
      sortDirection: "desc",
      limit: 20
    };
  }

  function resolveReportYear(rows) {
    const periods = rows.map(function (row) {
      return {
        year: Number.parseInt(String(row && row.source_year), 10),
        liters: parseNumber(row && row.total_litros)
      };
    }).filter(function (row) {
      return Number.isInteger(row.year) && row.year >= 1900 && row.year <= 2200 &&
        row.liters !== null && row.liters > 0;
    }).sort(function (left, right) {
      return right.year - left.year;
    });

    return periods.some(function (row) { return row.year === PREFERRED_YEAR; })
      ? PREFERRED_YEAR
      : (periods[0] ? periods[0].year : PREFERRED_YEAR);
  }

  function updatePeriodLabels() {
    document.querySelectorAll("[data-report-year]").forEach(function (element) {
      element.textContent = String(reportYear);
    });
  }

  function summaryRequest() {
    return {
      groupBy: ["source_year"],
      aggregations: [
        { column: "litros_pedidos", operation: "SUM", alias: "total_litros" },
        { column: "producto", operation: "COUNT", alias: "filas_con_producto" }
      ],
      filters: yearFilter(),
      sortBy: "total_litros",
      sortDirection: "desc",
      limit: 1
    };
  }

  function productsRequest(limit) {
    return {
      groupBy: ["producto"],
      aggregations: [
        { column: "litros_pedidos", operation: "SUM", alias: "litros" },
        { column: "producto", operation: "COUNT", alias: "filas_pedido" }
      ],
      filters: yearFilter(),
      sortBy: "litros",
      sortDirection: "desc",
      limit: limit
    };
  }

  function catalogRequest() {
    return {
      groupBy: ["producto", "rubro"],
      aggregations: [
        { column: "producto", operation: "COUNT", alias: "filas_catalogo" }
      ],
      filters: [],
      sortBy: "producto",
      sortDirection: "asc",
      limit: 50000
    };
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
      entry.rows += parseNumber(row.filas_catalogo) || 0;
      const rubro = displayText(row.rubro, "");
      if (rubro) entry.rubros.add(rubro);
    });
    return { index: index, missingProduct: missingProduct };
  }

  function joinCatalog(rankingRows, catalog) {
    let missingMatch = 0;
    let ambiguous = 0;
    let duplicatedCatalog = 0;
    let missingProduct = 0;
    const enriched = [];
    rankingRows.forEach(function (row) {
      const producto = displayText(row.producto, "");
      const key = normalizeText(producto);
      const litros = parseNumber(row.litros);
      if (!key || litros === null) {
        missingProduct += 1;
        return;
      }
      const match = catalog.index.get(key);
      let rubro = "Sin asignar";
      if (!match) {
        missingMatch += 1;
      } else {
        if (match.rows > 1) duplicatedCatalog += 1;
        if (match.rubros.size === 1) rubro = Array.from(match.rubros)[0];
        if (match.rubros.size > 1) ambiguous += 1;
      }
      enriched.push({
        producto: producto,
        rubro: rubro,
        litros: litros,
        fechaId: String(reportYear)
      });
    });
    return {
      rows: enriched,
      quality: {
        missingMatch: missingMatch,
        ambiguous: ambiguous,
        duplicatedCatalog: duplicatedCatalog,
        catalogMissingProduct: catalog.missingProduct,
        missingProduct: missingProduct
      }
    };
  }

  function prepareModel(summaryRows, rankingRows, productRows, catalogRows) {
    if (rankingRows.length && !summaryRows.length) {
      throw new Error("La consulta anual no devolvió el total necesario para validar el ranking.");
    }
    const annualLiters = summaryRows.length ? parseNumber(summaryRows[0].total_litros) : 0;
    if (summaryRows.length && annualLiters === null) {
      throw new Error("La métrica total_litros no es numérica en la respuesta agregada.");
    }
    const catalog = buildCatalogIndex(catalogRows);
    const joined = joinCatalog(rankingRows, catalog);
    const ranking = joined.rows.map(function (row, index) {
      return Object.assign({}, row, {
        posicion: index + 1,
        participacion: annualLiters ? row.litros / annualLiters * 100 : 0
      });
    });

    model.ranking = ranking;
    model.annualLiters = annualLiters;
    model.annualProducts = productRows.filter(function (row) {
      return normalizeText(row.producto) && parseNumber(row.litros) !== null;
    }).length;
    model.quality = Object.assign({}, joined.quality, {
      rankingGroups: rankingRows.length,
      catalogGroups: catalogRows.length,
      aggregatedProducts: model.annualProducts,
      rowsWithProduct: summaryRows.length ? parseNumber(summaryRows[0].filas_con_producto) || 0 : 0
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
      kpiCard("Litros pedidos", numberFormat.format(model.annualLiters) + " L", "Total válido del período " + reportYear, "Volumen anual", "default", false),
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
    const cautions = q.missingProduct + q.missingMatch + q.ambiguous;
    byId("traceSummary").textContent = cautions
      ? "Las agregaciones se ejecutaron sobre el total autorizado y el cruce conserva las excepciones sin inventar relaciones."
      : "Las agregaciones servidoras y el cruce de productos no presentan excepciones en el Top 100.";
    const items = [
      numberFormat.format(q.rowsWithProduct) + " pedidos " + reportYear + " con producto",
      numberFormat.format(q.aggregatedProducts) + " productos agregados",
      numberFormat.format(q.rankingGroups) + " posiciones recibidas",
      numberFormat.format(q.catalogGroups) + " grupos de catálogo",
      numberFormat.format(q.missingProduct) + " grupos inválidos",
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
    byId("tableSummary").textContent = "Top " + model.ranking.length + " de " + numberFormat.format(model.annualProducts) + " productos con pedidos válidos en " + reportYear + ".";
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
      const periodRows = await aggregateRows(CONTRACT.datasets.orders, periodsRequest());
      reportYear = resolveReportYear(periodRows);
      updatePeriodLabels();

      const results = await Promise.all([
        aggregateRows(CONTRACT.datasets.orders, summaryRequest()),
        aggregateRows(CONTRACT.datasets.orders, productsRequest(100)),
        aggregateRows(CONTRACT.datasets.orders, productsRequest(50000)),
        aggregateRows(CONTRACT.datasets.catalog, catalogRequest())
      ]);
      prepareModel(results[0], results[1], results[2], results[3]);
      if (!model.ranking.length) {
        byId("connectionStatus").textContent = "Sin datos para " + reportYear;
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
