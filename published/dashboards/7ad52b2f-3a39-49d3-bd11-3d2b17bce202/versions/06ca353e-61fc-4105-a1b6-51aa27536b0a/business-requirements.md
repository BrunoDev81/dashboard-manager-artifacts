# Business requirements

Dashboard: Ranking de productos pedidos
Business area: Deposito
Template: Dashboard en blanco

Goal:
Mostrar a los vendedores los productos más y menos pedidos según litros_pedidos.

Requested requirements:
Objetivo: Mostrar a los vendedores los productos más y menos pedidos según litros_pedidos.
Area: Deposito
Usuarios objetivo: Key Users
Metricas: litros_pedidos
Campos visibles: producto, litros_pedidos
Datos auxiliares: pedidos
Instrucciones extra: ORIENTACIÓN CODEX CONFIRMADA POR EL KEY USER:
Recomendación: cerrar el brief como “Ranking de productos pedidos”. Motivo: reúne el objetivo de comparar productos por litros_pedidos para Equipos operativos de Deposito, usando Dashboard en blanco y Pedidos. Supuesto: todavía no se definieron filtros. Próximo paso: ¿confirmás este brief completo?
Recomendación: dar por confirmado el brief final con kpi-cards, bar-chart y data-table sobre pedidos.
Motivo: litros_pedidos será el indicador principal y producto permitirá construir y validar el ranking. Se mantiene key-users como audiencia y no se definen filtros.
Próximo paso: el brief está listo para continuar; cualquier creación o publicación queda sujeta a una acción posterior del usuario.
Preparar el dashboard para trabajo asistido por Codex: leer dashboard.manifest.json como contrato, usar allowedDataSources y editableStateKeys como unica fuente autorizada, consultar datos solo por DashboardManager SDK/MCP cuando este disponible, documentar supuestos de cruces entre datasets y dejar README.md con pasos de validacion e importacion desde GitHub.

ESTANDAR DE WIDGETS CORPORATIVOS: usar exclusivamente los widgets aprobados seleccionados: KPIs con estado (maximo 6; proposito declarado: Resumir litros_pedidos.), Barras comparativas (maximo 3; proposito declarado: Comparar litros_pedidos por producto.), Tabla analítica (maximo 2; proposito declarado: Mostrar el detalle por producto.). No crear widgets, graficos o componentes visuales nuevos sin aprobacion administrativa. Respetar los datos necesarios, los usos y las restricciones del catalogo; mantener el estilo corporativo con tarjetas claras, estados semanticos y animacion sutil solo cuando aporte lectura.

Acceptance:
- The dashboard must be readable by key users.
- The dashboard must use only allowed datasets and editable state keys.
- The dashboard must pass the Dashboard Manager package validator.