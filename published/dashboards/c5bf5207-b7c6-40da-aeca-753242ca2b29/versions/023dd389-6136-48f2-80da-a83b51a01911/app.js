const STATE_KEY = "metas";
let currentStateVersion = 0;

const fallbackSdk = {
  async getCurrentUser() {
    return { displayName: "Demo local", email: "demo.local@empresa.local" };
  },
  async getState() {
    const payload = JSON.parse(localStorage.getItem("dm-demo-state") || "{}");
    return { stateKey: STATE_KEY, payload, version: Number(localStorage.getItem("dm-demo-version") || "0") };
  },
  async setState(_key, payload, version) {
    const nextVersion = version + 1;
    localStorage.setItem("dm-demo-state", JSON.stringify(payload));
    localStorage.setItem("dm-demo-version", String(nextVersion));
    return { stateKey: STATE_KEY, payload, version: nextVersion, updatedBy: "demo-local", updatedAt: new Date().toISOString() };
  },
  async getStateHistory() {
    return [];
  },
  async getDataset(_name, params) {
    const rows = [
      { code: "P001", description: "Producto Demo 1", category: "Categoria A", brand: "Marca Demo", family: "Familia 1", status: "ACTIVO" },
      { code: "P002", description: "Producto Demo 2", category: "Categoria B", brand: "Marca Demo", family: "Familia 2", status: "ACTIVO" },
      { code: "P003", description: "Producto Demo 3", category: "Categoria C", brand: "Marca Demo", family: "Familia 3", status: "INACTIVO" }
    ];
    const search = (params?.search || "").toLowerCase();
    const items = rows.filter(r => JSON.stringify(r).toLowerCase().includes(search));
    return { dataset: "productos_catalogo", page: 1, pageSize: 10, total: items.length, items };
  },
  async lookupDataset(_name, key) {
    const result = await this.getDataset("productos_catalogo", { search: key });
    return result.items.find(x => x.code === key) || null;
  }
};

const SDK = window.DashboardManager || fallbackSdk;

function $(id) {
  return document.getElementById(id);
}

function toast(message, type = "info") {
  const el = $("toast");
  el.textContent = message;
  el.className = `toast ${type}`;
  setTimeout(() => el.className = "toast hidden", 4200);
}

function pretty(value) {
  return JSON.stringify(value ?? {}, null, 2);
}

function updateMetrics(state) {
  const payload = state?.payload || {};
  $("metricMeta").textContent = payload.metaPorcentaje != null ? `${payload.metaPorcentaje}%` : "--%";
  $("metricProducto").textContent = payload.producto || "---";
  $("metricDescripcion").textContent = payload.descripcion || "Sin selección";
  $("metricEstado").textContent = payload.estado || "Pendiente";
  $("metricVersion").textContent = String(state?.version ?? 0);
}

function fillForm(payload = {}) {
  $("producto").value = payload.producto || "";
  $("descripcion").value = payload.descripcion || "";
  $("metaPorcentaje").value = payload.metaPorcentaje ?? "";
  $("estado").value = payload.estado || "Borrador";
  $("comentario").value = payload.comentario || "";
}

async function initUser() {
  try {
    const user = await SDK.getCurrentUser();
    $("sdkStatus").textContent = window.DashboardManager ? "SDK conectado" : "Modo demo local";
    $("userInfo").textContent = `${user.displayName || user.username || "Usuario"} · ${user.email || "sin email"}`;
    document.querySelector(".status-dot").classList.add("ready");
  } catch (error) {
    $("sdkStatus").textContent = "SDK con error";
    $("userInfo").textContent = error?.message || "No se pudo conectar";
  }
}

async function loadState() {
  try {
    const state = await SDK.getState(STATE_KEY);
    currentStateVersion = state.version ?? 0;
    fillForm(state.payload);
    updateMetrics(state);
    $("payloadView").textContent = pretty(state.payload);
    toast("Metas cargadas correctamente.");
  } catch (error) {
    toast(error?.message || "No pudimos cargar las metas.", "error");
  }
}

async function searchProducts() {
  const search = $("searchInput").value.trim();
  const results = $("datasetResults");
  results.className = "results";
  results.textContent = "Buscando...";

  try {
    const response = await SDK.getDataset("productos_catalogo", { search, page: 1, pageSize: 10 });
    const items = response.items || [];

    if (!items.length) {
      results.className = "results empty";
      results.textContent = "Sin resultados.";
      return;
    }

    results.innerHTML = "";
    for (const item of items) {
      const row = document.createElement("div");
      row.className = "result-item";
      row.innerHTML = `
        <div>
          <strong>${item.code} · ${item.description}</strong>
          <small>${item.category || "-"} · ${item.brand || "-"} · ${item.status || "-"}</small>
        </div>
        <button class="button ghost" data-code="${item.code}">Seleccionar</button>
      `;

      row.querySelector("button").addEventListener("click", async () => {
        const product = await SDK.lookupDataset("productos_catalogo", item.code);
        $("producto").value = product?.code || item.code;
        $("descripcion").value = product?.description || item.description;
        toast("Producto seleccionado.");
      });

      results.appendChild(row);
    }
  } catch (error) {
    results.className = "results empty";
    results.textContent = error?.message || "No pudimos consultar el dataset.";
  }
}

async function saveState(event) {
  event.preventDefault();

  const reason = $("changeReason").value.trim();
  if (!reason) {
    toast("Informá el motivo del cambio.", "error");
    return;
  }

  const payload = {
    producto: $("producto").value.trim(),
    descripcion: $("descripcion").value.trim(),
    metaPorcentaje: Number($("metaPorcentaje").value || 0),
    estado: $("estado").value,
    comentario: $("comentario").value.trim(),
    actualizadoDesde: "dashboard-publicado",
    actualizadoEn: new Date().toISOString()
  };

  try {
    const updated = await SDK.setState(STATE_KEY, payload, currentStateVersion, reason);
    currentStateVersion = updated.version ?? currentStateVersion + 1;
    fillForm(updated.payload);
    updateMetrics(updated);
    $("payloadView").textContent = pretty(updated.payload);
    $("changeReason").value = "";
    toast("Cambios guardados correctamente.");
  } catch (error) {
    const msg = error?.message || "No pudimos guardar los cambios.";
    if (String(msg).includes("409") || String(msg).toLowerCase().includes("versión")) {
      toast("Otro usuario modificó estos datos antes que vos. Actualizá y volvé a intentar.", "error");
    } else {
      toast(msg, "error");
    }
  }
}

async function loadHistory() {
  const view = $("historyView");
  view.className = "history";
  view.textContent = "Cargando historial...";

  try {
    const history = await SDK.getStateHistory(STATE_KEY);
    if (!history?.length) {
      view.className = "history empty";
      view.textContent = "Todavía no hay cambios para esta clave.";
      return;
    }

    view.innerHTML = history.slice(0, 8).map(item => `
      <div class="history-item">
        <strong>${item.changeReason || "Cambio sin motivo"}</strong>
        <small>${item.changedBy || "usuario"} · ${new Date(item.changedAt).toLocaleString("es-AR")}</small>
        <pre>${pretty(item.newPayloadJson || item.newPayload || item.payload)}</pre>
      </div>
    `).join("");
  } catch (error) {
    view.className = "history empty";
    view.textContent = error?.message || "No pudimos cargar el historial.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initUser();
  $("btnLoadState").addEventListener("click", loadState);
  $("btnSearch").addEventListener("click", searchProducts);
  $("btnHistory").addEventListener("click", loadHistory);
  $("stateForm").addEventListener("submit", saveState);
  loadState();
});
