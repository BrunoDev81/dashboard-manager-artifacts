(() => {
  "use strict";

  const DATASETS = Object.freeze({
    products: "productos_catalogo",
    orders: "pedidos"
  });

  const currentYear = new Date().getFullYear();
  const elements = {
    currentYear: document.getElementById("currentYear"),
    yearFilter: document.getElementById("yearFilter"),
    rubroFilter: document.getElementById("rubroFilter"),
    retryButton: document.getElementById("retryButton"),
    loadingState: document.getElementById("loadingState"),
    errorState: document.getElementById("errorState"),
    errorMessage: document.getElementById("errorMessage"),
    emptyState: document.getElementById("emptyState"),
    dashboardContent: document.getElementById("dashboardContent"),
    totalLiters: document.getElementById("totalLiters"),
    productCount: document.getElementById("productCount"),
    productCountDetail: document.getElementById("productCountDetail"),
    leaderName: document.getElementById("leaderName"),
    leaderLiters: document.getElementById("leaderLiters"),
    rankingCount: document.getElementById("rankingCount"),
    ranking: document.getElementById("ranking"),
    searchInput: document.getElementById("searchInput"),
    sortField: document.getElementById("sortField"),
    sortDirection: document.getElementById("sortDirection"),
    tableBody: document.getElementById("tableBody"),
    tableEmpty: document.getElementById("tableEmpty"),
    qualitySummary: document.getElementById("qualitySummary")
  };

  const state = {
    preparedOrders: [],
    topRows: [],
    quality: null
  };

  const litersFormatter = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2
  });

  function setVisible(element, visible) {
    element.classList.toggle("hidden", !visible);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeText(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("es-AR");
  }

  function extractRows(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.rows)) return response.rows;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    return [];
  }

  function parseYear(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.getFullYear();
    }

    const text = String(value ?? "").trim();
    if (!text) return null;

    const leadingYear = text.match(/^(19\d{2}|20\d{2}|21\d{2})(?:\D|\d{4})/);
    if (leadingYear) return Number(leadingYear[1]);

    const dayFirst = text.match(/^\d{1,2}[\/-]\d{1,2}[\/-](19\d{2}|20\d{2}|21\d{2})$/);
    if (dayFirst) return Number(dayFirst[1]);

    if (/^(19\d{2}|20\d{2}|21\d{2})$/.test(text)) return Number(text);
    return null;
  }

  function orderYear(order) {
    const fechaYear = parseYear(order?.fecha_id);
    return fechaYear ?? parseYear(order?.source_year);
  }

  function parseLiters(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;

    let text = String(value ?? "").trim().replace(/\s/g, "");
    if (!text) return null;

    if (text.includes(",") && text.includes(".")) {
      if (text.lastIndexOf(",") > text.lastIndexOf(".")) {
        text = text.replaceAll(".", "").replace(",", ".");
      } else {
        text = text.replaceAll(",", "");
      }
    } else if (text.includes(",")) {
      text = text.replace(",", ".");
    }

    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function createCatalogIndex(products) {
    const grouped = new Map();
    let rowsWithoutProduct = 0;

    products.forEach((row) => {
      const key = normalizeText(row?.producto);
      if (!key) {
        rowsWithoutProduct += 1;
        return;
      }
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(row);
    });

    const index = new Map();
    let duplicateKeys = 0;
    let ambiguousKeys = 0;

    grouped.forEach((rows, key) => {
      if (rows.length > 1) {
        duplicateKeys += 1;
        ambiguousKeys += 1;
        index.set(key, { status: "ambiguous", rubro: null });
        return;
      }

      const rubro = String(rows[0]?.rubro ?? "").trim() || null;
      index.set(key, { status: "matched", rubro });
    });

    return { index, duplicateKeys, ambiguousKeys, rowsWithoutProduct };
  }

  function prepareOrders(orders, catalog) {
    const quality = {
      orderRows: orders.length,
      currentYearRows: 0,
      invalidDateRows: 0,
      invalidLiterRows: 0,
      rowsWithoutProduct: 0,
      unmatchedRows: 0,
      ambiguousOrderRows: 0,
      catalogDuplicateKeys: catalog.duplicateKeys,
      catalogAmbiguousKeys: catalog.ambiguousKeys,
      catalogRowsWithoutProduct: catalog.rowsWithoutProduct
    };

    const prepared = [];

    orders.forEach((order) => {
      const year = orderYear(order);
      if (year === null) {
        quality.invalidDateRows += 1;
        return;
      }
      if (year !== currentYear) return;

      quality.currentYearRows += 1;
      const product = String(order?.producto ?? "").trim();
      const productKey = normalizeText(product);
      if (!productKey) {
        quality.rowsWithoutProduct += 1;
        return;
      }

      const liters = parseLiters(order?.litros_pedidos);
      if (liters === null) {
        quality.invalidLiterRows += 1;
        return;
      }

      const catalogEntry = catalog.index.get(productKey);
      let rubro = null;
      let relation = "unmatched";

      if (!catalogEntry) {
        quality.unmatchedRows += 1;
      } else if (catalogEntry.status === "ambiguous") {
        relation = "ambiguous";
        quality.ambiguousOrderRows += 1;
      } else {
        relation = "matched";
        rubro = catalogEntry.rubro;
      }

      prepared.push({
        product,
        productKey,
        liters,
        rubro,
        rubroKey: normalizeText(rubro),
        relation
      });
    });

    return { prepared, quality };
  }

  function populateRubroFilter() {
    const previousValue = elements.rubroFilter.value;
    const rubros = new Map();

    state.preparedOrders.forEach((row) => {
      if (row.relation === "matched" && row.rubro && !rubros.has(row.rubroKey)) {
        rubros.set(row.rubroKey, row.rubro);
      }
    });

    const options = [...rubros.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], "es-AR", { sensitivity: "base" })
    );

    elements.rubroFilter.innerHTML = '<option value="">Todos los rubros</option>' + options
      .map(([key, label]) => `<option value="${escapeHtml(key)}">${escapeHtml(label)}</option>`)
      .join("");

    if (rubros.has(previousValue)) elements.rubroFilter.value = previousValue;
    elements.rubroFilter.disabled = false;
  }

  function aggregateFilteredRows() {
    const selectedRubro = elements.rubroFilter.value;
    const grouped = new Map();

    state.preparedOrders.forEach((row) => {
      if (selectedRubro && row.rubroKey !== selectedRubro) return;

      if (!grouped.has(row.productKey)) {
        grouped.set(row.productKey, {
          product: row.product,
          rubro: row.relation === "matched" ? row.rubro : null,
          liters: 0
        });
      }

      const aggregate = grouped.get(row.productKey);
      aggregate.liters += row.liters;
      if (!aggregate.rubro && row.relation === "matched") aggregate.rubro = row.rubro;
    });

    return [...grouped.values()].sort((a, b) =>
      b.liters - a.liters || a.product.localeCompare(b.product, "es-AR", { sensitivity: "base" })
    );
  }

  function formatLiters(value) {
    return `${litersFormatter.format(value)} L`;
  }

  function renderRanking(rows) {
    const maximum = Math.max(0, ...rows.map((row) => row.liters));
    elements.ranking.innerHTML = rows.map((row, index) => {
      const width = maximum > 0 ? Math.max(0, (row.liters / maximum) * 100) : 0;
      return `
        <div class="ranking-row">
          <span class="rank-position">${index + 1}</span>
          <span class="rank-product" title="${escapeHtml(row.product)}">${escapeHtml(row.product)}</span>
          <span class="rank-track" aria-hidden="true">
            <span class="rank-bar" style="--bar-width:${width.toFixed(3)}%"></span>
          </span>
          <span class="rank-value">${escapeHtml(formatLiters(row.liters))}</span>
        </div>`;
    }).join("");
  }

  function tableComparator(field, direction) {
    const factor = direction === "desc" ? -1 : 1;
    return (a, b) => {
      if (field === "position") return (a.position - b.position) * factor;
      if (field === "liters") return (a.liters - b.liters) * factor;
      const left = field === "rubro" ? (a.rubro ?? "") : a.product;
      const right = field === "rubro" ? (b.rubro ?? "") : b.product;
      return left.localeCompare(right, "es-AR", { sensitivity: "base" }) * factor;
    };
  }

  function renderTable() {
    const term = normalizeText(elements.searchInput.value);
    const rows = state.topRows
      .map((row, index) => ({ ...row, position: index + 1 }))
      .filter((row) => !term || normalizeText(`${row.product} ${row.rubro ?? ""}`).includes(term))
      .sort(tableComparator(elements.sortField.value, elements.sortDirection.value));

    elements.tableBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.position}</td>
        <td><strong>${escapeHtml(row.product)}</strong></td>
        <td>${row.rubro ? `<span class="rubro-pill">${escapeHtml(row.rubro)}</span>` : "—"}</td>
        <td>${currentYear}</td>
        <td class="numeric"><strong>${escapeHtml(formatLiters(row.liters))}</strong></td>
      </tr>`).join("");

    setVisible(elements.tableEmpty, rows.length === 0);
  }

  function renderQuality() {
    const quality = state.quality;
    elements.qualitySummary.textContent =
      `${quality.currentYearRows} pedidos correspondieron a ${currentYear}. ` +
      `${quality.invalidDateRows} filas no tuvieron una fecha interpretable; ` +
      `${quality.invalidLiterRows} tuvieron litros no numéricos; ` +
      `${quality.unmatchedRows} no coincidieron con el catálogo y ` +
      `${quality.ambiguousOrderRows} coincidieron con productos duplicados. ` +
      `El catálogo presentó ${quality.catalogDuplicateKeys} productos descriptivos duplicados. ` +
      "Las relaciones inexistentes o ambiguas no recibieron un rubro.";
  }

  function renderDashboard() {
    const allAggregates = aggregateFilteredRows();
    const topRows = allAggregates.slice(0, 100);
    state.topRows = topRows;

    const totalLiters = allAggregates.reduce((sum, row) => sum + row.liters, 0);
    const leader = topRows[0];

    elements.totalLiters.textContent = formatLiters(totalLiters);
    elements.productCount.textContent = litersFormatter.format(allAggregates.length);
    elements.productCountDetail.textContent = `${topRows.length} visibles en el ranking`;
    elements.leaderName.textContent = leader?.product ?? "—";
    elements.leaderName.title = leader?.product ?? "";
    elements.leaderLiters.textContent = leader ? formatLiters(leader.liters) : "Sin volumen";
    elements.rankingCount.textContent = `${topRows.length} ${topRows.length === 1 ? "producto" : "productos"}`;

    const hasResults = topRows.length > 0;
    setVisible(elements.emptyState, !hasResults);
    setVisible(elements.dashboardContent, hasResults);

    if (hasResults) {
      renderRanking(topRows);
      renderTable();
      renderQuality();
    }
  }

  function showLoading() {
    setVisible(elements.loadingState, true);
    setVisible(elements.errorState, false);
    setVisible(elements.emptyState, false);
    setVisible(elements.dashboardContent, false);
    setVisible(elements.retryButton, false);
    elements.rubroFilter.disabled = true;
  }

  function showError(error) {
    const detail = error instanceof Error && error.message
      ? `Detalle: ${error.message}`
      : "Revisá la disponibilidad del Dashboard Manager SDK e intentá nuevamente.";
    elements.errorMessage.textContent = detail;
    setVisible(elements.loadingState, false);
    setVisible(elements.errorState, true);
    setVisible(elements.emptyState, false);
    setVisible(elements.dashboardContent, false);
    setVisible(elements.retryButton, true);
  }

  async function loadDashboard() {
    showLoading();

    try {
      const sdk = window.DashboardManager;
      if (!sdk || typeof sdk.aggregateDataset !== "function") {
        throw new Error("DashboardManager no está disponible en este entorno.");
      }

      const [productResponse, orderResponse] = await Promise.all([
        sdk.aggregateDataset(DATASETS.products, {
          groupBy: ["producto", "rubro"],
          aggregations: [{ column: "producto_id", operation: "COUNT", alias: "catalog_count" }],
          filters: [],
          sortBy: "producto",
          sortDirection: "asc",
          limit: 50000
        }),
        sdk.aggregateDataset(DATASETS.orders, {
          groupBy: ["source_year", "producto"],
          aggregations: [{ column: "litros_pedidos", operation: "SUM", alias: "litros_pedidos" }],
          filters: [{ column: "source_year", operator: "EQ", value: String(currentYear) }],
          sortBy: "litros_pedidos",
          sortDirection: "desc",
          limit: 50000
        })
      ]);

      const products = extractRows(productResponse);
      const orders = extractRows(orderResponse);
      const catalog = createCatalogIndex(products);
      const result = prepareOrders(orders, catalog);

      state.preparedOrders = result.prepared;
      state.quality = result.quality;
      populateRubroFilter();

      setVisible(elements.loadingState, false);
      setVisible(elements.errorState, false);
      setVisible(elements.retryButton, false);
      renderDashboard();
    } catch (error) {
      showError(error);
    }
  }

  elements.currentYear.textContent = String(currentYear);
  elements.yearFilter.options[0].textContent = String(currentYear);
  elements.rubroFilter.addEventListener("change", renderDashboard);
  elements.searchInput.addEventListener("input", renderTable);
  elements.sortField.addEventListener("change", renderTable);
  elements.sortDirection.addEventListener("change", renderTable);
  elements.retryButton.addEventListener("click", loadDashboard);

  loadDashboard();
})();
