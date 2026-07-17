# Business requirements

Dashboard: Resumen ejecutivo de Calidad
Business area: Calidad
Template: Dashboard en blanco

Goal:
Dashboard de calidad para concentra los indicadores y decisiones que requieren una lectura rapida.

Requested requirements:
Objetivo: Dashboard de calidad para concentra los indicadores y decisiones que requieren una lectura rapida.
Area: Calidad
Usuarios objetivo: Key Users y responsables de calidad.
Metricas: Resumen ejecutivo de Calidad, Cumplimiento de Calidad, Desvio relevante de Calidad, Acciones pendientes de Calidad
Campos visibles: Resumen ejecutivo de Calidad, Cumplimiento de Calidad, Desvio relevante de Calidad, Acciones pendientes de Calidad, calidad_lotes, areas_catalogo, Cliente Id, Unidad Negocio, Organizacion Venta, Canal, Oficina Venta, Jefatura
Filtros: Periodo, Categoria, Estado, Responsable
Datos auxiliares: clientes_catalogo
Datos editables: acciones_calidad, comentarios, acciones
Instrucciones extra: Usar el paquete corporativo Resumen ejecutivo de Calidad. Incluir KPIs: Resumen ejecutivo de Calidad, Cumplimiento de Calidad, Desvio relevante de Calidad, Acciones pendientes de Calidad. Incluir insights: Prioridades de Calidad, Desvios a revisar en resumen ejecutivo, Responsables con acciones, Oportunidades de mejora.
ESTANDAR DE WIDGETS CORPORATIVOS: usar exclusivamente los widgets aprobados seleccionados: KPIs con estado (maximo 6), Burbujas de prioridad (maximo 1), Pareto 80/20 (maximo 1), Matriz de riesgo (maximo 1), Heatmap de actividad (maximo 1), Timeline (maximo 1), Tabla analítica (maximo 2). No crear widgets, graficos o componentes visuales nuevos sin aprobacion administrativa. Respetar los datos necesarios, los usos y las restricciones del catalogo; mantener el estilo corporativo con tarjetas claras, estados semanticos y animacion sutil solo cuando aporte lectura.
Preparar el dashboard para trabajo asistido por Codex: leer dashboard.manifest.json como contrato, usar allowedDataSources y editableStateKeys como unica fuente autorizada, consultar datos solo por DashboardManager SDK/MCP cuando este disponible, documentar supuestos de cruces entre datasets y dejar README.md con pasos de validacion e importacion desde GitHub.

ESTANDAR DE WIDGETS CORPORATIVOS: usar exclusivamente los widgets aprobados seleccionados: KPIs con estado (maximo 6), Burbujas de prioridad (maximo 1), Pareto 80/20 (maximo 1), Matriz de riesgo (maximo 1), Heatmap de actividad (maximo 1), Timeline (maximo 1), Tabla analítica (maximo 2). No crear widgets, graficos o componentes visuales nuevos sin aprobacion administrativa. Respetar los datos necesarios, los usos y las restricciones del catalogo; mantener el estilo corporativo con tarjetas claras, estados semanticos y animacion sutil solo cuando aporte lectura.

Acceptance:
- The dashboard must be readable by key users.
- The dashboard must use only allowed datasets and editable state keys.
- The dashboard must pass the Dashboard Manager package validator.