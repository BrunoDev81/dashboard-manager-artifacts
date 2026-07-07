# Dashboard Prueba Manager

Dashboard de prueba para validar:

- `dashboard-sdk.js`
- `DashboardManager.getCurrentUser()`
- `DashboardManager.getState("metas")`
- `DashboardManager.setState("metas", payload, version, reason)`
- `DashboardManager.getStateHistory("metas")`
- `DashboardManager.getDataset("productos_catalogo")`
- `DashboardManager.lookupDataset("productos_catalogo", key)`

## Uso

Subir el ZIP en Dashboard Manager como nueva versión.

Manifest:

- `entrypoint`: `index.html`
- `version`: `1.0.1`
- `editableStateKeys`: `metas`, `comentarios`, `simulaciones`
- `allowedDataSources`: `productos_catalogo`

Si abrís el HTML fuera del portal, entra en modo demo local usando `localStorage`.
