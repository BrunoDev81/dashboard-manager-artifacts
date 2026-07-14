# Producto Stock Abajo 50

Dashboard operativo para identificar productos con menos de 50 unidades en stock de depósito. Está preparado para publicarse en Dashboard Manager y usa exclusivamente el SDK corporativo.

## Contrato de ejecución

- Fuente autorizada: `dim_producto`.
- Estados editables: ninguno.
- Archivos estáticos de datos: ninguno.
- Integración de runtime: `DashboardManager.getDataset("dim_producto", {})`.
- Identidad visual: `GRUPO_DISAL_LOCKED`.
- No requiere backend, credenciales, tokens, CDN ni servicios externos.

`dashboard.manifest.json` es la única fuente autorizada para datasets y estados editables.

## Criterio del dashboard

Se incluyen únicamente registros cuyo `und_stock_deposito` sea menor a 50. El estado operativo se deriva de ese campo:

- Sin stock: menor o igual a 0.
- Crítico: entre 1 y 10.
- Bajo: entre 11 y 25.
- Atención: entre 26 y 49.

La interfaz presenta cuatro KPIs con estado, un ranking horizontal y una tabla analítica, dentro de los widgets corporativos aprobados.

## Campos utilizados

- `producto_id`: código del producto.
- `producto`: descripción.
- `marca`, `grupo`, `clase_material`: segmentación y detalle.
- `und_stock_deposito`: criterio de inclusión, estado y orden.
- `und_stock_transito`: indicador complementario.

El contrato también autoriza volumen material, división y volúmenes de stock. Se normalizan en la capa de presentación para permitir futuras mejoras sin incorporar nuevas fuentes.

## Supuestos y límites

- El dataset no expone campos de período ni responsable. Por eso no se inventan esos filtros; quedan reemplazados por búsqueda, marca, grupo y estado de stock, todos derivados de columnas autorizadas.
- No existen cruces entre datasets.
- Los valores numéricos nulos o vacíos se interpretan como 0 para la lectura operativa.
- La tabla muestra hasta 100 filas para mantener una respuesta fluida; los KPIs y el ranking contemplan todos los registros filtrados.
- Si la forma de respuesta del SDK varía, la interfaz acepta un arreglo directo o colecciones en `rows`, `data`, `items`, `records`, `results` o `result`.

## Validación

1. Confirmar que `dashboard.manifest.json` sea JSON válido y conserve `visualIdentity: GRUPO_DISAL_LOCKED`.
2. Confirmar que `allowedDataSources` contenga únicamente `dim_producto` y que `editableStateKeys` esté vacío.
3. Verificar que `index.html` incluya exactamente `<script src="/dashboard-sdk.js"></script>`.
4. Buscar y descartar CDN, scripts remotos, `eval`, llamadas `fetch`, endpoints `/api`, secretos o credenciales.
5. Abrir el dashboard desde Dashboard Manager y validar carga, error, estado vacío, filtros, KPIs, ranking y tabla.
6. Probar vista de escritorio y móvil.
7. Ejecutar el validador de paquetes de Dashboard Manager antes de importar.

## Importación desde GitHub

Usar el repositorio `BrunoDev81/dashboard-manager-artifacts`, branch `main`, y la ruta:

`dashboard-manager-artifacts/dashboards/deposito/producto-stock-abajo-50`

Dashboard Manager debe resolver `index.html` como entrypoint y proveer `/dashboard-sdk.js` dentro del iframe sandbox.
