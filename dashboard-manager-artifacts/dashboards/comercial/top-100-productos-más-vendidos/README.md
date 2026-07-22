# Top 100 productos más vendidos

Dashboard analítico para Key Users del área Comercial. Identifica los 100 productos con mayor volumen pedido durante el año actual y permite filtrar el resultado por rubro.

## Identidad visual

La interfaz aplica exclusivamente `GRUPO_DISAL_LOCKED`:

- fondo ambiental claro `#eef7ff` y `#f9fcff`;
- tarjetas blancas y bordes `#cfe2f5`;
- azul corporativo `#0072bc` y celeste `#00a6df`;
- verde, ámbar y rojo reservados para estados semánticos.

No se incluye modo oscuro, recursos externos ni controles para modificar la identidad.

## Fuentes autorizadas

El dashboard consulta en runtime, mediante `DashboardManager.getDataset`, únicamente:

- `pedidos`: aporta `fecha_id`, `source_year`, `producto` y `litros_pedidos`.
- `productos_catalogo`: aporta `producto` y `rubro` para el cruce descriptivo.

No se incorporan datasets, archivos estáticos de negocio, snapshots ni datos de demostración. `staticDataFiles` permanece vacío.

## Reglas de cálculo

1. El año se interpreta primero desde `pedidos.fecha_id`.
2. Se admiten representaciones que comiencen con un año de cuatro dígitos, fechas con separadores y fechas en formato día/mes/año.
3. Cuando `fecha_id` no permite obtener un año válido, se usa `source_year` como respaldo.
4. Las filas sin año interpretable se excluyen y se contabilizan en la nota de trazabilidad.
5. Solo se conservan pedidos cuyo año coincide con el año actual del entorno de ejecución.
6. `litros_pedidos` se convierte a número contemplando separadores decimales razonables. Los valores vacíos o no numéricos se excluyen y contabilizan.
7. Los pedidos se agrupan por el valor normalizado de `producto`, sin cambiar su significado, y se suma `litros_pedidos`.
8. El resultado se ordena de mayor a menor y se limita a 100 productos después de aplicar los filtros.
9. El total mostrado se calcula sobre todos los productos agregados que cumplen el filtro; la cantidad visible informa cuántos integran el Top 100.

## Cruce por producto y filtro Rubro

No existe una clave técnica común declarada entre ambos datasets. Por eso, el cruce utiliza exclusivamente el campo descriptivo `producto`:

- se eliminan espacios exteriores y espacios repetidos;
- se ignoran diferencias de mayúsculas y acentos;
- no se aplican equivalencias, códigos alternativos ni relaciones inferidas;
- si un producto aparece más de una vez en el catálogo, la coincidencia se considera ambigua;
- los pedidos sin coincidencia o con coincidencia ambigua no reciben un rubro;
- el selector Rubro contiene solo valores reales de registros relacionados inequívocamente;
- al seleccionar un rubro, quedan incluidos únicamente los pedidos relacionados con ese valor.

Cuando se seleccionan todos los rubros, los pedidos sin relación inequívoca siguen participando del ranking general, pero su rubro se muestra vacío en la tabla. Esto conserva el volumen real de pedidos sin inventar una clasificación.

## Visualizaciones implementadas

### Ranking horizontal

Vista principal autorizada. Muestra posición, producto, suma de litros pedidos y una escala proporcional respecto del producto líder. Mantiene siempre el orden descendente del Top 100.

### Tabla analítica

Usa exactamente las mismas filas agregadas del ranking y muestra:

- posición original;
- producto;
- rubro, solo cuando la relación es inequívoca;
- período;
- litros pedidos agregados.

La búsqueda y el orden son locales y no modifican el ranking ni vuelven a consultar los datasets.

El análisis Pareto no se incluye porque no figura en `governanceContract.approvedWidgets`. Tampoco se incluyen KPI, barras, embudo o alertas basados en ventas, clientes o metas, ya que esos campos y datasets no están autorizados para este dashboard. No se sustituyen por métricas inventadas.

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

La interfaz no invoca `getState` ni `setState` y no incorpora formularios de edición. Las claves permanecen declaradas únicamente para conservar los permisos existentes.

## Validación previa a la importación

1. Validar que `dashboard.manifest.json` sea JSON válido.
2. Confirmar `entrypoint: index.html`, `visualIdentity: GRUPO_DISAL_LOCKED` y `staticDataFiles: []`.
3. Confirmar que `allowedDataSources` contiene únicamente `productos_catalogo` y `pedidos`.
4. Confirmar que `editableStateKeys` contiene únicamente `comentarios`, `acciones` y `metas`.
5. Verificar que `index.html` carga una sola vez `dashboard-sdk.js` y no contiene recursos externos.
6. Verificar que `app.js` llama una vez a `DashboardManager.getDataset` para cada dataset, sin `limit`, `offset`, `fetch` ni datos demo.
7. Probar fechas válidas, respaldo con `source_year`, fechas inválidas, litros nulos y litros no numéricos.
8. Contrastar la suma del resultado filtrado con la suma de sus productos agregados.
9. Confirmar orden descendente, límite de 100 y correspondencia entre ranking y tabla.
10. Probar catálogo vacío, pedidos vacíos, productos duplicados, pedidos sin coincidencia, filtro sin resultados y error del SDK.
11. Revisar la vista en escritorio, tablet y móvil.
12. Confirmar que `index.html`, `style.css` y `app.js` no contienen fondos oscuros prohibidos, variantes oscuras ni paletas alternativas.

La importación y la publicación no forman parte de esta entrega. El paquete no contiene secretos, credenciales, endpoints externos ni conexiones directas.
