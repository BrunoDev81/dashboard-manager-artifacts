# Top 100 productos más vendidos

Dashboard estático para Key Users del área Comercial. Identifica los 100 productos con mayor volumen pedido durante 2026 y permite validar cada resultado desde una tabla analítica.

## Alcance funcional

- Período fijo: 2026. No se muestran controles de Año ni Rubro.
- Métrica: suma de `litros_pedidos` por producto.
- Resumen: litros anuales, cantidad de productos con pedidos, producto líder y concentración del Top 10.
- Detalle: Top 100 con posición original, producto, rubro, fecha/período, litros pedidos y participación sobre el volumen anual.
- Interacción: búsqueda local por producto o rubro y ordenamiento de columnas. La posición siempre conserva el ranking autoritativo por litros.
- Estados contemplados: carga, error con reintento, respuesta válida sin resultados y búsqueda sin coincidencias.
- La interfaz no consume archivos locales ni muestra el bloque explicativo de fuentes solicitado para remoción.

## Contrato de datos

El contrato ejecutable está en `dashboard.manifest.json`. Las únicas fuentes autorizadas son `pedidos` y `productos_catalogo`; las claves editables permitidas son `comentarios`, `acciones` y `metas`.

| Campo o cálculo | Dataset | Uso |
| --- | --- | --- |
| `source_year` | `pedidos` | Condición temporal 2026. |
| `fecha_id` | `pedidos` | Se presenta como contexto anual consolidado en la tabla. |
| `producto` | `pedidos` | Dimensión del ranking y clave descriptiva del cruce. |
| `litros_pedidos` | `pedidos` | Métrica sumada por producto. |
| `producto` | `productos_catalogo` | Clave descriptiva normalizada para enriquecer el ranking. |
| `rubro` | `productos_catalogo` | Atributo informativo de la tabla y de la búsqueda. |

La aplicación consulta ambos datasets mediante `DashboardManager.aggregateDataset(nombre, request)`. El filtro `source_year = 2026`, las sumas, agrupaciones, orden y límites se ejecutan en el servidor sobre el conjunto completo autorizado, sin `fetch` ni conexión directa a la base.

### Estrategia de agregación

- Resumen anual: agrupación por `source_year`, suma de `litros_pedidos` y conteo de pedidos con producto.
- Ranking: agrupación por `producto`, suma de `litros_pedidos`, orden descendente y límite servidor de 100.
- Cobertura: la misma agrupación por producto con límite de seguridad de 50.000 grupos para contar productos distintos.
- Catálogo: agrupación por `producto` y `rubro` para enriquecer el Top 100 sin multiplicar litros.
- La respuesta válida del SDK se normaliza desde la colección `items`. Un formato desconocido se muestra como error y no como cero resultados.

## Supuesto de cruce y controles

No existe una clave técnica común declarada entre `pedidos` y `productos_catalogo`. El cruce se realiza únicamente por el texto de `producto`, normalizado en mayúsculas/minúsculas, acentos y espacios, sin modificar su significado.

- Si un producto de pedidos no existe en el catálogo, se conserva en el ranking con Rubro `Sin asignar`.
- Si el catálogo devuelve más de un rubro para el mismo producto normalizado, se conserva el producto con Rubro `Sin asignar` y se registra como ambiguo.
- Los duplicados del catálogo se informan en trazabilidad y no multiplican litros.
- Los grupos sin producto o con una métrica no numérica se excluyen del Top 100 y se informan en trazabilidad.
- No se inventan equivalencias, relaciones ni datos faltantes.

Pregunta pendiente para el responsable de datos: ¿puede incorporarse una clave técnica común de producto en `pedidos` para reemplazar el cruce descriptivo por nombre?

## Estados editables

El manifest conserva exactamente `comentarios`, `acciones` y `metas` porque forman parte del contrato autorizado. Esta versión no presenta formularios ni guarda datos editables, por lo que no llama a `getState` ni `setState` y no requiere resolver conflictos 409 en la interfaz. Una evolución que incorpore edición deberá cargar primero la versión con `getState`, guardar con `setState` y recargar el estado vigente ante un conflicto 409.

## Archivos y seguridad

- `dashboard.manifest.json`: contrato de importación, versión 1.0.2.
- `workspace.json`: metadata del workspace y `dashboardId` existente.
- `index.html`: estructura accesible y carga única de `/dashboard-sdk.js`.
- `style.css`: identidad clara `GRUPO_DISAL_LOCKED`, responsive y sin modo oscuro.
- `app.js`: carga, validación, agregación, cruce, búsqueda, orden y estados operativos.
- `staticDataFiles` permanece vacío. No hay CSV, JSON, payloads ni archivos corporativos consumidos.
- No hay CDN, scripts remotos, `eval`, secretos, tokens, endpoints internos ni almacenamiento local.

## Validación antes de importar

1. Confirmar que `dashboard.manifest.json` y `workspace.json` declaren la versión `1.0.2` y el dashboardId `141181fb-dd0e-4f5d-9254-822de6dc934e`.
2. Ejecutar el validador de paquetes de Dashboard Manager.
3. Verificar que `/disal_logo_informe.png` y `/dashboard-sdk.js` estén disponibles en el entorno de vista previa.
4. Probar la envoltura agregada oficial `{ dataset, items }`, una colección vacía, un formato desconocido y un rechazo del SDK.
5. Contrastar el total anual, la cantidad de productos y las primeras posiciones contra una consulta autorizada de control para 2026.
6. Probar productos sin catálogo, duplicados, rubros ambiguos y valores inválidos.
7. Verificar carga, error, reintento, ausencia de resultados, búsqueda sin coincidencias y ordenamiento.
8. Revisar la vista en escritorio, tablet y móvil dentro del iframe sandbox.
9. Confirmar que no aparezcan controles de Año/Rubro ni una sección titulada “Fuentes de datos”.
10. Importar desde la ruta GitHub declarada en el manifest únicamente después de completar las verificaciones.

## Versionado

La versión `1.0.2` corrige el cálculo que usaba `getDataset` y podía trabajar sobre una muestra acotada sin registros de 2026. Ahora los indicadores y el ranking se resuelven con agregaciones servidoras sobre todo el dataset autorizado. Mantiene el dashboardId, los datasets, las claves editables, la identidad visual y los permisos definidos.
