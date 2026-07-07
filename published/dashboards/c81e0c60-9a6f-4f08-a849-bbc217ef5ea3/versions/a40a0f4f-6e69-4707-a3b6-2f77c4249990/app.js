const rows = [
  ["ABC123", "15%", "Em simulacao"],
  ["XYZ900", "22%", "Aprovado"],
  ["LMN456", "10%", "Revisao"]
];

let currentState = {
  stateKey: "metas",
  payload: {},
  version: 0
};

let selectedProduct = null;

const tbody = document.getElementById("rows");
const productResults = document.getElementById("productResults");
const statusElement = document.getElementById("status");
const outputElement = document.getElementById("stateOutput");
const productoSearchInput = document.getElementById("productoSearch");
const productoInput = document.getElementById("producto");
const metaInput = document.getElementById("metaPorcentaje");
const estadoInput = document.getElementById("estado");
const comentarioInput = document.getElementById("comentarioGerente");

for (const row of rows) {
  const tr = document.createElement("tr");
  for (const cell of row) {
    const td = document.createElement("td");
    td.textContent = cell;
    tr.appendChild(td);
  }
  tbody.appendChild(tr);
}

document.getElementById("searchProduct").addEventListener("click", async () => {
  await searchProducts();
});

document.getElementById("loadState").addEventListener("click", async () => {
  await loadMetas();
});

document.getElementById("saveState").addEventListener("click", async () => {
  await saveMetas();
});

async function searchProducts() {
  if (!window.DashboardManager) {
    showStatus("SDK no disponible. Abrilo dentro del portal Dashboard Manager.", true);
    return;
  }

  try {
    showStatus("Buscando producto...");
    const result = await window.DashboardManager.getDataset("productos_catalogo", {
      search: productoSearchInput.value,
      page: 1,
      pageSize: 10
    });
    renderProducts(result.items || []);
    showStatus("Busqueda finalizada.");
  } catch (error) {
    showStatus(error.message || "No pudimos buscar productos.", true);
  }
}

async function loadMetas() {
  if (!window.DashboardManager) {
    showStatus("SDK no disponible. Abrilo dentro del portal Dashboard Manager.", true);
    return;
  }

  try {
    showStatus("Cargando metas...");
    currentState = await window.DashboardManager.getState("metas");
    renderState(currentState);
    hydrateForm(currentState.payload || {});
    showStatus("Metas cargadas.");
  } catch (error) {
    showStatus(error.message || "No pudimos cargar las metas.", true);
  }
}

async function saveMetas() {
  if (!window.DashboardManager) {
    showStatus("SDK no disponible. Abrilo dentro del portal Dashboard Manager.", true);
    return;
  }

  const payload = {
    producto: productoInput.value,
    productoDescripcion: selectedProduct ? selectedProduct.description : undefined,
    productoSeleccionado: selectedProduct
      ? {
          code: selectedProduct.code,
          description: selectedProduct.description
        }
      : undefined,
    metaPorcentaje: Number(metaInput.value),
    estado: estadoInput.value,
    comentarioGerente: comentarioInput.value
  };

  try {
    showStatus("Guardando cambios...");
    currentState = await window.DashboardManager.setState(
      "metas",
      payload,
      currentState.version,
      "Ajuste desde dashboard publicado"
    );
    renderState(currentState);
    showStatus("Cambios guardados.");
  } catch (error) {
    showStatus(error.message || "No pudimos guardar los cambios.", true);
  }
}

function renderProducts(items) {
  productResults.innerHTML = "";
  if (items.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "Sin resultados";
    tr.appendChild(td);
    productResults.appendChild(tr);
    return;
  }

  for (const product of items) {
    const tr = document.createElement("tr");
    for (const key of ["code", "description", "category", "brand"]) {
      const td = document.createElement("td");
      td.textContent = product[key] || "";
      tr.appendChild(td);
    }

    const action = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Seleccionar";
    button.addEventListener("click", () => selectProduct(product));
    action.appendChild(button);
    tr.appendChild(action);
    productResults.appendChild(tr);
  }
}

function selectProduct(product) {
  selectedProduct = product;
  productoInput.value = product.code || "";
  comentarioInput.value = product.description || comentarioInput.value;
  showStatus("Producto seleccionado.");
}

function hydrateForm(payload) {
  if (payload.producto) {
    productoInput.value = payload.producto;
  }
  if (payload.productoSeleccionado) {
    selectedProduct = payload.productoSeleccionado;
  }
  if (payload.metaPorcentaje !== undefined) {
    metaInput.value = payload.metaPorcentaje;
  }
  if (payload.estado) {
    estadoInput.value = payload.estado;
  }
  if (payload.comentarioGerente) {
    comentarioInput.value = payload.comentarioGerente;
  }
}

function renderState(state) {
  outputElement.textContent = JSON.stringify(state, null, 2);
}

function showStatus(message, isError) {
  statusElement.textContent = message;
  statusElement.className = isError ? "status error" : "status";
}
