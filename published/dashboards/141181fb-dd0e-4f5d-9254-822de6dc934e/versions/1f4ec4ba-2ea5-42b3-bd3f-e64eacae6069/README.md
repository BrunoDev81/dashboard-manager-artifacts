# Top 100 productos más vendidos

Dashboard analítico para Key Users del área Comercial. Identifica los 100 productos con mayor volumen pedido durante el año actual y permite filtrar el resultado por rubro.

## Identidad visual

La interfaz aplica exclusivamente `GRUPO_DISAL_LOCKED`:

- fondo ambiental claro `#eef7ff` y `#f9fcff`;
- tarjetas blancas y bordes `#cfe2f5`;
- azul corporativo `#0072bc` y celeste `#00a6df`;
- verde, ámbar y rojo reservados para estados semánticos.

No se incluye modo oscuro, recursos externos ni controles para modificar la identidad.

## Procedencia de los datos

Los valores reales no provienen de archivos locales. Se consultan en tiempo de ejecución mediante Dashboard Manager SDK, exclusivamente desde los datasets autorizados `pedidos` y `productos_catalogo`.

La interfaz resume la procedencia así: “Pedidos: volumen por producto · Catálogo de productos: rubro”.

La implementación vigente utiliza `DashboardManager.aggregateDataset` para solicitar los datos agregados. No realiza conexiones directas, no usa archivos estáticos de negocio y no incorpora datos de demostración. `staticDataFiles` permanece vacío.

## Mapa campo–dataset

| Campo | Dataset | Uso en el dashboard |
| --- | --- | --- |
| `fecha_id` | `pedidos` | Campo de fecha declarado para identificar el período del pedido cuando está disponible en una respuesta de pedidos. |
| `source_year` | `pedidos` | Año de origen usado por la consulta vigente para filtrar los pedidos del año actual. También funciona como respaldo para interpretar el período. |
| `producto` | `pedidos` | Dimensión descriptiva usada para agrupar el volumen y para relacionar el pedido con el catálogo. |
| `litros_pedidos` | `pedidos` | Métrica sumada por producto para ordenar el Top 100. |
| `producto` | `productos_catalogo` | Texto descriptivo usado como criterio de cruce con `pedidos.producto`. |
| `rubro` | `productos_catalogo` | Clasificación incorporada después de una coincidencia inequívoca con el catálogo. No se atribuye directamente a `pedidos`. |

## Consulta y cálculo

La consulta de `pedidos` agrupa por `source_year` y `producto`, suma `litros_pedidos` y solicita únicamente el año actual. La consulta de `productos_catalogo` agrupa por `producto` y `rubro` para construir el índice descriptivo de productos.

Sobre las respuestas obtenidas mediante el SDK se aplican estas reglas:

1. El año se interpreta primero desde `pedidos.fecha_id` cuando el campo está presente.
2. Se admiten representaciones que comiencen con un año de cuatro dígitos, fechas con separadores y fechas en formato día/mes/año.
3. Cuando `fecha_id` no permite obtener un año válido o no está presente, se usa `source_year`.
4. Las filas sin año interpretable se excluyen y se contabilizan en la nota de trazabilidad.
5. Solo se conservan pedidos cuyo año coincide con el año actual del entorno de ejecución.
6. `litros_pedidos` se convierte a número contemplando separadores decimales razonables. Los valores vacíos o no numéricos se excluyen y contabilizan.
7. Los pedidos se agrupan por el valor normalizado de `producto` y se suma `litros_pedidos`.
8. El resultado se ordena de mayor a menor y se limita a 100 productos después de aplicar el filtro por rubro.
9. El total mostrado se calcula sobre todos los productos agregados que cumplen el filtro; la cantidad visible informa cuántos integran el Top 100.

## Cruce por producto y filtro Rubro

No existe una clave técnica común declarada entre `pedidos` y `productos_catalogo`. El cruce utiliza exclusivamente el texto normalizado del campo `producto`:

- se eliminan espacios exteriores y espacios repetidos;
- se ignoran diferencias de mayúsculas y acentos;
- no se aplican equivalencias, códigos alternativos ni relaciones inferidas;
- si un producto aparece más de una vez en el catálogo, la coincidencia se considera ambigua;
- los pedidos sin coincidencia o con coincidencia ambigua no reciben un rubro;
- el selector Rubro contiene solo valores obtenidos de relaciones inequívocas;
- al seleccionar un rubro, quedan incluidos únicamente los pedidos relacionados con ese valor.

Cuando se seleccionan todos los rubros, los pedidos sin relación inequívoca siguen participando del resultado general, pero su rubro se muestra vacío en la tabla. Esto conserva el volumen consultado sin inventar una clasificación.

La nota de trazabilidad mantiene visibles las cantidades de coincidencias inexistentes, ambiguas y duplicadas para que el Key User pueda evaluar la calidad del cruce descriptivo.

## Visualizaciones implementadas

### KPI cards

El resumen muestra los litros pedidos del resultado filtrado, la cantidad de productos agregados y el producto líder. Todos los valores derivan del mismo resultado consultado y transformado en runtime.

### Tabla analítica

Es el principal detalle visible después de los KPIs. Presenta el Top 100 ordenado por litros pedidos y muestra:

- posición original;
- producto;
- rubro, solo cuando la relación es inequívoca;
- período;
- litros pedidos agregados.

La búsqueda y el orden son locales, no alteran la posición original del Top 100 ni vuelven a consultar los datasets.

El análisis Pareto no se incluye porque no figura en `governanceContract.approvedWidgets`. Tampoco se incluyen barras, embudo o alertas basados en ventas, clientes o metas, ya que esos campos y fuentes no están autorizados para este dashboard. No se sustituyen por métricas inventadas.

## Estados de interfaz

- `Cargando`: aparece mientras se consultan ambos datasets.
- `Error`: aparece si el SDK no está disponible o una consulta falla, con opción de reintento.
- `Sin resultados`: aparece únicamente después de completar una consulta legítima cuando los filtros no producen registros agregados.
- `Trazabilidad`: informa fechas inválidas, litros no numéricos, pedidos sin relación, coincidencias ambiguas y duplicados del catálogo.

## Datos editables y permisos

El manifest conserva exactamente las claves autorizadas:

- `comentarios`
- `acciones`
- `metas`

La interfaz no invoca operaciones de estado ni incorpora formularios de edición. Las claves permanecen declaradas únicamente para conservar los contratos de seguridad existentes.

## Validación previa a la importación

1. Validar que `dashboard.manifest.json` sea JSON válido.
2. Confirmar `entrypoint: index.html`, `visualIdentity: GRUPO_DISAL_LOCKED` y `staticDataFiles: []`.
3. Confirmar que `allowedDataSources` contiene únicamente `productos_catalogo` y `pedidos`.
4. Confirmar que `editableStateKeys` contiene únicamente `comentarios`, `acciones` y `metas`.
5. Verificar que `index.html` conserva el logo `/disal_logo_informe.png`, carga `dashboard-sdk.js` y no contiene recursos externos.
6. Verificar que la aclaración visible indique que `pedidos` aporta el volumen por producto, `productos_catalogo` aporta el rubro y los valores reales se obtienen en runtime mediante Dashboard Manager SDK.
7. Verificar que `app.js` consulta únicamente `pedidos` y `productos_catalogo` mediante `DashboardManager.aggregateDataset`.
8. Confirmar que `rubro` se obtiene únicamente de `productos_catalogo` y que el cruce se realiza por el texto normalizado de `producto`.
9. Probar fechas válidas, respaldo con `source_year`, fechas inválidas, litros nulos y litros no numéricos.
10. Contrastar la suma del resultado filtrado con la suma de sus productos agregados.
11. Confirmar año actual, filtro por rubro, orden descendente, límite máximo de 100 y posición original en la tabla.
12. Probar catálogo vacío, pedidos vacíos, productos duplicados, pedidos sin coincidencia, filtro sin resultados, búsqueda sin coincidencias y error del SDK.
13. Confirmar que no permanezcan en la interfaz ni en `app.js` referencias a la visualización retirada o a sus elementos exclusivos.
14. Revisar la vista en escritorio, tablet y móvil.
15. Confirmar que `index.html`, `style.css` y `app.js` no contienen fondos oscuros prohibidos, variantes oscuras ni paletas alternativas.

La importación y la publicación no forman parte de esta entrega. El paquete no contiene secretos, credenciales, endpoints externos ni conexiones directas.
