# Business requirements

Dashboard: Top 100 productos más vendidos
Business area: Comercial
Template: Performance de Ventas

Goal:
Identificar los 100 productos con mayor volumen pedido durante el año actual.

Requested requirements:
Objetivo: Identificar los 100 productos con mayor volumen pedido durante el año actual.
Area: Comercial
Usuarios objetivo: Key Users
Metricas: litros_pedidos
Campos visibles: fecha_id, producto, litros_pedidos, rubro
Filtros: fecha_id, rubro
Datos auxiliares: productos_catalogo, pedidos
Datos editables: comentarios, acciones, metas
Instrucciones extra: ORIENTACIÓN CODEX CONFIRMADA POR EL KEY USER:
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

Acceptance:
- The dashboard must be readable by key users.
- The dashboard must use only allowed datasets and editable state keys.
- The dashboard must pass the Dashboard Manager package validator.