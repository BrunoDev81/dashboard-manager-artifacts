# Business requirements

Dashboard: Mix de Productos
Business area: 1
Template: Mix de Productos

Goal:
Identificar los 100 productos con mayor volumen pedido durante el último trimestre.

Requested requirements:
Objetivo: Identificar los 100 productos con mayor volumen pedido durante el último trimestre.
Area: 1
Usuarios objetivo: Key Users
Metricas: Participacion top productos, Concentracion del mix, Productos en crecimiento, Productos en caida, Volumen por familia
Campos visibles: Participacion top productos, Concentracion del mix, Productos en crecimiento, Productos en caida, Volumen por familia, productos_catalogo
Filtros: Periodo, Categoria, Estado
Datos auxiliares: productos_catalogo
Datos editables: comentarios, acciones_mix, simulaciones
Instrucciones extra: ORIENTACIÓN CODEX CONFIRMADA POR EL KEY USER:
Resumen final para confirmación:
Objetivo: identificar los 100 productos con mayor volumen pedido del último trimestre para Gerentes comerciales.
Referencia visual: Mix de Productos.
Dataset: Pedidos.
Medida: Litros Pedidos.
Filtros: período y Grupo Comercial.
Orden de lectura:
1. Ranking horizontal: Producto + Litros Pedidos, orden descendente y limitado a los primeros 100; permite priorizar productos por volumen.
2. Participación donut: Producto + Litros Pedidos; permite ver la participación de cada producto dentro del ranking.
Supuesto confirmado: “más vendidos” se interpreta como mayor volumen en Litros Pedidos. El donut se mantiene por tu decisión, aunque puede concentrar muchas categorías.
¿Confirmás este resumen final?
Preparar el dashboard para trabajo asistido por Codex: leer dashboard.manifest.json como contrato, usar allowedDataSources y editableStateKeys como unica fuente autorizada, consultar datos solo por DashboardManager SDK/MCP cuando este disponible, documentar supuestos de cruces entre datasets y dejar README.md con pasos de validacion e importacion desde GitHub.

PLAN DE MONTAJE VISUAL CONFIRMADO POR EL KEY USER:
1. KPIs con estado [kpi-cards]
   Sección/orden: pieza 1 del recorrido principal.
   Información y decisión: Decisión: Detectar rápidamente desvíos relevantes para Identificar los 100 productos con mayor volumen pedido durante el último trimestre. Datasets: productos_catalogo, ventas_mensuales. Mapeo: Valor actual, comparación y estado de Participacion top productos, Concentracion del mix, Productos en crecimiento. Sección: Resumen inicial del dashboard..
   Contrato visual: Métrica, comparación y estado. Uso recomendado: Indicadores clave al inicio. Límite: 6.
2. Ranking horizontal [horizontal-ranking]
   Sección/orden: pieza 2 del recorrido principal.
   Información y decisión: Permite a Gerentes comerciales priorizar los 100 productos de mayor volumen pedido dentro del período y Grupo Comercial seleccionados; usa Pedidos, muestra Producto y Litros Pedidos, y aparece primero en la sección principal de ranking..
   Contrato visual: Categoría, valor y orden. Uso recomendado: Ordenar un top o bottom. Límite: 2.
3. Participación donut [donut]
   Sección/orden: pieza 3 del recorrido principal.
   Información y decisión: Permite interpretar la participación de Litros Pedidos por Producto dentro del ranking seleccionado; usa Pedidos, muestra Producto y Litros Pedidos, y aparece después del ranking en la sección de composición..
   Contrato visual: Categoría y participación. Uso recomendado: Explicar una proporción simple. Límite: 1.
4. Treemap jerárquico [treemap]
   Sección/orden: pieza 4 del recorrido principal.
   Información y decisión: Decisión: Ver peso relativo por grupo para Identificar los 100 productos con mayor volumen pedido durante el último trimestre. Datasets: productos_catalogo, ventas_mensuales. Mapeo: Grupo, subgrupo y valor. Sección: Vista principal del dashboard..
   Contrato visual: Grupo, subgrupo y valor. Uso recomendado: Ver peso relativo por grupo. Límite: 1.
5. Tabla analítica [data-table]
   Sección/orden: pieza 5 del recorrido principal.
   Información y decisión: Decisión: Validar los valores de los gráficos y analizar casos particulares. Datasets: productos_catalogo, ventas_mensuales. Mapeo: Detalle de Participacion top productos, Concentracion del mix, Productos en crecimiento y Participacion top productos, Concentracion del mix, Productos en crecimiento, con búsqueda, orden y Periodo, Categoria, Estado. Sección: Sección de detalle..
   Contrato visual: Columnas visibles y clave. Uso recomendado: Detalle, búsqueda y acciones. Límite: 2.

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