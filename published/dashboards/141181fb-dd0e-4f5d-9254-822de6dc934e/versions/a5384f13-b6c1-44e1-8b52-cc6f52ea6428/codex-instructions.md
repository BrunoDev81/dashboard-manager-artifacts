# Instrucciones para Codex

Este proyecto es un dashboard para Dashboard Manager.

Objetivo del dashboard:
Identificar los 100 productos con mayor volumen pedido durante el año actual.

Reglas obligatorias:
- Usar HTML, CSS y JavaScript puro.
- No usar React, Vue, Angular ni frameworks con build.
- No usar backend propio.
- No usar Node, Python, PHP ni servicios externos.
- No usar CDN externa.
- No usar scripts remotos.
- No usar eval.
- No incluir tokens, passwords ni secrets.
- No conectarse directo a bases de datos.
- No hacer fetch directo a /api.
- Usar solamente /dashboard-sdk.js para integrarse con la plataforma.
- Si Dashboard Manager MCP esta configurado para tu sesion, usarlo solo para describir o muestrear los datasets permitidos abajo.
- No pedir al Key User tokens ni configuracion MCP. Si MCP no esta disponible, continuar con el manifest y DashboardManager SDK.
- No pedir ni guardar tokens MCP, credenciales, SQL ni connection strings en este repositorio.
- Leer governed-files.manifest.json antes de usar archivos corporativos. El manifest fija assetId, versionId y SHA-256 sin copiar el contenido gobernado al repositorio.
- Para leer el contenido de un archivo corporativo usar dashboard_manager_read_editable_file con assetId y versionId. Nunca pedir al Key User que arrastre otra copia al chat.
- Si el MCP no esta disponible, no inventar ni sustituir el archivo: conservar su referencia y explicar que hace falta una sesion corporativa autorizada para leerlo.
- Mantener obligatoriamente visualIdentity: GRUPO_DISAL_LOCKED en dashboard.manifest.json.
- El archivo workspace.json nace con preparationStatus PENDING_CODEX_BUILD. Solo después de implementar y verificar una versión funcional, cambiarlo a READY_FOR_IMPORT y dashboardManager.publicationAllowed a true.
- Nunca marcar READY_FOR_IMPORT si el dashboard conserva el contenido inicial vacío o si todavía faltan métricas, widgets o consultas requeridas por el brief.
- Mostrar la marca GRUPO DISAL y usar solo fondo claro azul muy suave (#eef7ff / #f9fcff), tarjetas blancas, borde #cfe2f5, azul #0072bc y celeste #00a6df.
- Usar verde #009a44 solo para exito, ambar #f3b51b solo para alertas y rojo #c43e4b solo para errores o riesgos.
- No usar fondos negros u oscuros, gradientes pesados, violeta, rosa, paletas por area, logos alternativos ni controles para cambiar la identidad corporativa.
- Nunca declarar background o background-color con black, #000, #000000, #111, #111111, #111827, #0f172a o #1f2937 en HTML, CSS o JavaScript, incluidos graficos, tooltips, modales, hovers y fallbacks.
- No incluir prefers-color-scheme: dark, color-scheme: dark, clases .dark ni un modo oscuro alternativo.

SDK disponible:
DashboardManager.getCurrentUser()
DashboardManager.getDataset(datasetName, params)
DashboardManager.lookupDataset(datasetName, key)
DashboardManager.getState(stateKey)
DashboardManager.setState(stateKey, payload, version, changeReason)
DashboardManager.getStateHistory(stateKey)

Reglas de consulta de datasets:
- DashboardManager.getDataset(datasetName) devuelve todos los registros autorizados, aunque el dataset tenga cientos de miles de filas.
- No usar limit ni offset: son parametros obsoletos y pueden ocultar registros.
- Para una tabla visual paginada, llamar getDataset con all=false, page y pageSize; la paginacion debe afectar solo la tabla, nunca los KPI o totales.

Datasets permitidos:
productos_catalogo, pedidos

MCP corporativo:
- El MCP ofrece datasets autorizados y archivos corporativos versionados con limites de lectura.
- No usar ni inferir datasets fuera de la lista permitida.
- Los datos reales se consultan en runtime exclusivamente por DashboardManager.getDataset o DashboardManager.lookupDataset.

Archivos corporativos gobernados:
- governed-files.manifest.json contiene solamente metadata, version activa y SHA-256.
- El contenido permanece en Dashboard Manager y se lee mediante dashboard_manager_read_editable_file bajo la identidad del usuario.
- No reemplazar un asset estable por un nombre de archivo suelto. Una nueva carga queda pendiente hasta que el Key User la active; restaurar una version cambia el puntero activo sin romper el dashboard.

Datos editables permitidos:
comentarios, acciones, metas

Archivos estaticos declarados:


Politica de archivos locales:
- CSV o JSON de negocio: solo dentro de data/.
- Snapshots de payload inicial: solo JSON dentro de payloads/.
- Declarar cada archivo usado en staticDataFiles de dashboard.manifest.json.
- No incluir datos sensibles, personales, secretos ni exportaciones completas sin agregacion.
- No usar localStorage como fuente compartida ni descargar datos desde URLs externas.
- Documentar origen, fecha, columnas, nivel de agregacion y responsable en README.md.

Archivos obligatorios:
dashboard.manifest.json
governed-files.manifest.json
index.html
style.css
app.js
README.md

Antes de finalizar:
- verificar que dashboard.manifest.json sea valido;
- verificar que index.html incluya /dashboard-sdk.js;
- verificar que no haya CDN;
- verificar que no haya fetch directo a /api;
- verificar que no haya secrets;
- verificar que no existan fondos oscuros prohibidos en index.html, style.css o app.js;
- mantener textos en espanol argentino.

Instrucciones adicionales:
Idioma del prompt: Espanol argentino.

## 1. Rol de la IA
Actua como arquitecto frontend senior especializado en dashboards corporativos estaticos para Dashboard Manager.
Debes entregar archivos listos para commit en GitHub e importacion en Dashboard Manager.

## 2. Objetivo del dashboard
Nombre sugerido: Top 100 productos más vendidos
Objetivo: Identificar los 100 productos con mayor volumen pedido durante el año actual.
Area de negocio: Comercial
Audiencia: Key Users
Nivel de detalle esperado: ANALYTICAL.
Orientacion para la IA: Explicar métricas y filtros con lenguaje funcional, permitir validación detallada y destacar supuestos o datos que requieren confirmación.
La interfaz final del dashboard debe estar en espanol argentino.

## 3. Contexto de negocio
Crear una experiencia clara para Key Users, con KPIs, filtros, tablas y estados vacios comprensibles.
Usar como referencia conceptual el template activo 'Performance de Ventas' (sales-performance): Dashboard para analizar ventas, volumen, cumplimiento y evolucion comercial.

## 4. Reglas obligatorias de la plataforma
- El dashboard sera publicado en Dashboard Manager.
- Debe ser estatico.
- Usar HTML, CSS y JavaScript puro.
- No usar React, Vue, Angular, Node, Python, PHP ni backend propio.
- No usar CDN externa, scripts remotos, eval, secrets, tokens ni connection strings.
- No conectarse directo a PostgreSQL ni a ningun banco.
- No usar fetch directo para /api.
- Incluir exactamente <script src="/dashboard-sdk.js"></script>.
- Usar solo DashboardManager.getDataset, DashboardManager.lookupDataset, DashboardManager.getState, DashboardManager.setState y DashboardManager.getStateHistory.
- DashboardManager.getDataset(nombre) devuelve todos los registros autorizados. No usar limit ni offset para KPI, totales, filtros o graficos.
- Si una tabla visual necesita paginacion, consultar con all=false, page y pageSize solo para esa tabla; los indicadores deben usar el dataset completo.
- Debe funcionar dentro de iframe sandbox.
- Usar exclusivamente widgets del catalogo corporativo declarados en las instrucciones. No crear widgets ni graficos nuevos sin aprobacion administrativa.

## 5. Datasets disponibles
Hay multiples datasets seleccionados para analisis cruzado. Usalos como fuentes auxiliares permitidas del Dashboard Manager SDK.
Podes cruzar datasets solo cuando existan columnas compatibles por nombre, significado de negocio o claves declaradas. No inventes joins ni relaciones ocultas.
Si la relacion entre datasets no es evidente, mostrá los datos por separado, explicá el supuesto en README.md y dejá el dashboard preparado para ajustar la relacion.
- productos_catalogo (Productos): Catalogo corporativo de productos proveniente de public.dim_producto.
  Origen: POSTGRES_TABLE. Tabla/query: public.dim_producto
  Clave sugerida: producto_id. Columna descriptiva: producto.
  Columnas visibles: producto_id (Producto Id), producto (Producto), producto_orden (Producto Orden), volumen_material (Volumen Material), clase_material (Clase Material), grupo (Grupo), rubro (Rubro), rubro_orden (Rubro Orden), linea (Linea), division (Division), tipo (Tipo), color (Color), marca_id (Marca Id), marca (Marca), producto_tipo_agrupador (Producto Tipo Agrupador), fecha_creacion_id (Fecha Creacion Id), grupo_presupuesto (Grupo Presupuesto), linea_fabricacion (Linea Fabricacion), semi_id (Semi Id), semi (Semi), lanzamiento (Lanzamiento), grupo_material (Grupo Material), duracion_material (Duracion Material), planta_id (Planta Id), planta (Planta), planta_secundaria_id (Planta Secundaria Id), planta_secundaria (Planta Secundaria), linea_fabricacion_id (Linea Fabricacion Id), linea_fabricacion_auxiliar (Linea Fabricacion Auxiliar), grupo_linea_fabricacion (Grupo Linea Fabricacion), tipo_produccion (Tipo Produccion), discontinuado (Discontinuado), cod_nom_producto (Cod Nom Producto), peso_bruto (Peso Bruto), grupo_material_id (Grupo Material Id), clase_material_id (Clase Material Id), criticidad_material_id (Criticidad Material Id), criticidad_materia (Criticidad Materia), grupo_compra (Grupo Compra), comprador (Comprador), updated_at (Updated At), und_stock_deposito (Und Stock Deposito), und_stock_transito (Und Stock Transito), vol_stock_deposito (Vol Stock Deposito), vol_stock_transito (Vol Stock Transito)
  Columnas buscables: producto_id, producto, clase_material, grupo, rubro, linea, division, marca, planta, cod_nom_producto
- pedidos (Pedidos): Fatos de pedidos provenientes de public.fact_pedido. Busca textual desativada inicialmente para preservar desempenho.
  Origen: POSTGRES_TABLE. Tabla/query: public.fact_pedido
  Clave sugerida: id. Columna descriptiva: producto.
  Columnas visibles: id (Id), fecha_id (Fecha Id), unidad_negocio (Unidad Negocio), grupo_comercial (Grupo Comercial), cliente_id (Cliente Id), cliente (Cliente), producto (Producto), litros_pedidos (Litros Pedidos), centro_logistico_nombre_corto (Centro Logistico Nombre Corto), source_year (Source Year), loaded_at (Loaded At)
  Columnas buscables: 

## 6. Datos editables
Usar editableStateKeys permitidos: comentarios, acciones, metas.
Si guardas datos editables, cargar primero con getState, guardar con setState usando version, y tratar conflictos HTTP 409.

## 7. Archivos corporativos versionados
No hay archivos corporativos seleccionados para este dashboard.
Si el análisis necesita además archivos locales, subirlos al mismo workspace GitHub: CSV o JSON de negocio en data/ y snapshots iniciales de datos editables en payloads/ como JSON.
No incrustar CSV grandes en app.js, no usar localStorage como base de datos, no descargar archivos desde URLs externas y no subir archivos sensibles o personales.
Cada archivo local que use la interfaz debe quedar declarado en staticDataFiles de dashboard.manifest.json, con rutas relativas seguras como data/ventas-2026.csv o payloads/estado-inicial.json.
Los CSV se leen como recursos estáticos del workspace; los cambios colaborativos siguen usando exclusivamente el SDK y editableStateKeys.
Documentar en README.md el origen, fecha de actualización, columnas, nivel de agregación y responsable de cada archivo para que otros usuarios puedan compartir el dashboard con contexto.

## 8. Requisitos visuales
Estilo visual: Estándar corporativo Grupo Disal.
La identidad visual es obligatoria e inalterable: GRUPO_DISAL_LOCKED.
- Mostrar la marca GRUPO DISAL en el encabezado del dashboard; no usar logos alternativos.
- Usar fondo claro blanco con efecto ambiental azul muy sutil (#eef7ff y #f9fcff), tarjetas blancas, bordes #cfe2f5 y sombras suaves.
- Usar azul corporativo #0072bc y celeste #00a6df como identidad; verde #009a44 solo para estados positivos; ambar #f3b51b solo para alertas; rojo #c43e4b solo para errores o riesgos.
- No usar fondos negros u oscuros, gradientes pesados, violeta, rosa, paletas por area, colores personalizados ni opciones de configuracion para cambiar fondo, logo o paleta.
- Nunca declarar background o background-color con black, #000, #000000, #111, #111111, #111827, #0f172a o #1f2937 en HTML, CSS o JavaScript, ni siquiera para tooltips, modales, graficos, estados hover o fallbacks.
- No incluir prefers-color-scheme: dark, color-scheme: dark, clases .dark ni un modo oscuro alternativo.
- Antes de entregar, revisar index.html, style.css y app.js para confirmar que no contienen ninguna de esas declaraciones de fondo oscuro.
- Mantener una lectura sobria, responsive, con buen contraste y estados de carga, error y sin resultados.

## 9. Requisitos funcionales
Metricas deseadas: litros_pedidos.
Campos visibles: fecha_id, producto, litros_pedidos, rubro.
Campos editables: comentarios, acciones, metas.
Filtros deseados: fecha_id, rubro.

## 10. Estructura obligatoria de archivos
- dashboard.manifest.json
- index.html
- style.css
- app.js
- README.md
- data/*.csv o data/*.json cuando corresponda
- payloads/*.json para snapshots iniciales cuando corresponda

## 11. Manifest obligatorio
Generar dashboard.manifest.json con este contenido base:
```json
{
  "name": "Top 100 productos más vendidos",
  "description": "Identificar los 100 productos con mayor volumen pedido durante el año actual.",
  "entrypoint": "index.html",
  "version": "1.0.0",
  "requiresApi": true,
  "visualIdentity": "GRUPO_DISAL_LOCKED",
  "allowedDataSources": ["productos_catalogo", "pedidos"],
  "editableStateKeys": ["comentarios", "acciones", "metas"],
  "staticDataFiles": []
}
```

## 12. Criterios de seguridad
No incluir datos sensibles, personales, contrasenas, secretos, tokens ni endpoints internos. No enviar datos a servicios externos.

## 13. Criterios de calidad
Codigo claro, comentado solo donde aporte valor, sin dependencias externas, con manejo de errores y README de uso.

## 14. Entrega esperada
Entregar el contenido completo de cada archivo para el workspace GitHub del dashboard.
No pedir credenciales, connection strings ni acceso directo al banco. Si falta contexto, dejar una pregunta concreta en README.md.

## 15. Handoff Codex / MCP
Codex debe leer dashboard.manifest.json como contrato de ejecucion del dashboard.
allowedDataSources define los datasets autorizados. editableStateKeys define los estados que se pueden leer o guardar.
Este prompt ya contiene el contrato de datos: no pedir al Key User token, configuracion MCP ni acceso directo a la base de datos.
Cuando MCP este disponible en la sesion del agente, usarlo para leer metadata y muestras seguras de los datasets autorizados. Si no esta disponible, continuar sin bloquear el trabajo y usar exclusivamente DashboardManager SDK en runtime.
No crear conexiones directas a PostgreSQL, no incluir secrets y no inferir permisos de acceso en este prompt.
Si cruza datasets, documentar columnas usadas, supuestos y fallback cuando la relacion no sea evidente.

## 16. Checklist final
- Manifest creado con entrypoint index.html.
- SDK incluido con <script src="/dashboard-sdk.js"></script>.
- Sin CDN externa, scripts remotos ni eval.
- Sin backend propio ni conexion directa a base de datos.
- Sin tokens, passwords, secrets ni connection strings.
- README.md incluido.
- Loading, error y empty state tratados.
- Conflicto de version tratado para datos editables.
- Archivos listos para commit en el workspace GitHub.
- Validar el dashboard antes de importarlo desde GitHub.
- Documentar supuestos de datasets, cruces y estados editables en README.md.
- Versionar CSV y JSON locales solo en data/; versionar snapshots de payload solo en payloads/.
- Declarar cada CSV o JSON que use el dashboard en staticDataFiles del manifest.
- Aplicar la identidad GRUPO_DISAL_LOCKED sin fondos oscuros ni paletas personalizadas.
- Datasets permitidos listados en allowedDataSources.
- Cruces entre datasets documentados con columnas compatibles y supuestos explicitos.
- EditableStateKeys listados en el manifest.
- No hay archivos corporativos seleccionados.

## Instrucciones adicionales del usuario
ORIENTACIÓN CODEX CONFIRMADA POR EL KEY USER:
Confirmación final registrada. Queda definido el dashboard Top 100 productos más vendidos para Key Users, con la referencia Performance de Ventas. Usará Pedidos y Productos, sumará Litros Pedidos por Producto y aplicará Año actual y Rubro. Incluirá Ranking horizontal como vista principal y Pareto 80/20 como análisis complementario. No se incorporan archivos editables ni elementos adicionales.
Preparar el dashboard para trabajo asistido por Codex: leer dashboard.manifest.json como contrato, usar allowedDataSources y editableStateKeys como unica fuente autorizada, consultar datos solo por DashboardManager SDK/MCP cuando este disponible, documentar supuestos de cruces entre datasets y dejar README.md con pasos de validacion e importacion desde GitHub.

PLAN DE MONTAJE VISUAL CONFIRMADO POR EL KEY USER:
1. KPIs con estado [kpi-cards]
   Sección/orden: pieza 1 del recorrido principal.
   Información y decisión: Decisión: Detectar rápidamente desvíos relevantes para Identificar los 100 productos con mayor volumen pedido durante el año actual. Datasets: productos_catalogo, clientes_catalogo. Mapeo: Valor actual, comparación y estado de Ventas netas, Volumen vendido, Cumplimiento de meta. Sección: Resumen inicial del dashboard..
   Contrato visual: Métrica, comparación y estado. Uso recomendado: Indicadores clave al inicio. Límite: 6.
2. Barras comparativas [bar-chart]
   Sección/orden: pieza 2 del recorrido principal.
   Información y decisión: Decisión: Reconocer líderes, rezagos y diferencias relevantes para Identificar los 100 productos con mayor volumen pedido durante el año actual. Datasets: productos_catalogo, clientes_catalogo. Mapeo: Ventas netas, Volumen vendido, Cumplimiento de meta comparadas por Ventas netas, Volumen vendido, Cumplimiento de meta. Sección: Vista principal de comparación..
   Contrato visual: Categoría y valor. Uso recomendado: Comparar categorías. Límite: 3.
3. Ranking horizontal [horizontal-ranking]
   Sección/orden: pieza 3 del recorrido principal.
   Información y decisión: Decidir qué 100 productos priorizar por volumen pedido; usa Pedidos con Producto y la suma de Litros Pedidos, filtrados por Fecha Id y Rubro; aparece como visual principal..
   Contrato visual: Categoría, valor y orden. Uso recomendado: Ordenar un top o bottom. Límite: 2.
4. Embudo [funnel]
   Sección/orden: pieza 4 del recorrido principal.
   Información y decisión: Decisión: Etapas y conversión para Identificar los 100 productos con mayor volumen pedido durante el año actual. Datasets: productos_catalogo, clientes_catalogo. Mapeo: Etapa y cantidad. Sección: Vista principal del dashboard..
   Contrato visual: Etapa y cantidad. Uso recomendado: Etapas y conversión. Límite: 1.
5. Tabla analítica [data-table]
   Sección/orden: pieza 5 del recorrido principal.
   Información y decisión: Decisión: Validar los valores de los gráficos y analizar casos particulares. Datasets: productos_catalogo, clientes_catalogo. Mapeo: Detalle de Ventas netas, Volumen vendido, Cumplimiento de meta y Ventas netas, Volumen vendido, Cumplimiento de meta, con búsqueda, orden y Periodo, Categoria, Estado. Sección: Sección de detalle..
   Contrato visual: Columnas visibles y clave. Uso recomendado: Detalle, búsqueda y acciones. Límite: 2.
6. Alertas priorizadas [alerts]
   Sección/orden: pieza 6 del recorrido principal.
   Información y decisión: Decisión: Priorizar los casos que requieren análisis o acción para Identificar los 100 productos con mayor volumen pedido durante el año actual. Datasets: productos_catalogo, clientes_catalogo. Mapeo: Excepciones, caídas o cambios relevantes de Ventas netas, Volumen vendido, Cumplimiento de meta. Sección: Bloque de alertas y prioridades..
   Contrato visual: Severidad, título y contexto. Uso recomendado: Excepciones que requieren acción. Límite: 1.

REGLAS DE ENSAMBLAJE:
- El template es solamente una referencia visual y funcional; no limita los widgets del catálogo corporativo.
- Implementar todas las piezas enumeradas con datos reales obtenidos exclusivamente de los datasets autorizados del brief.
- Conectar cada pieza a la métrica, campos, filtros y propósito declarados. Mantener el orden de lectura indicado.
- No sustituir, omitir ni agregar widgets sin aprobación explícita. Si existe una incompatibilidad real de datos, detener la construcción y explicarla.
- Nunca entregar un dashboard vacío, placeholder, texto de "listo para configurar" ni una maqueta pendiente. La primera versión debe ser funcional y previsualizable.
- No crear widgets, gráficos o componentes visuales fuera del catálogo aprobado. Mantener el estilo corporativo, estados de loading/error/sin datos y animación sutil solo cuando aporte lectura.
FIN DEL PLAN DE MONTAJE VISUAL.
