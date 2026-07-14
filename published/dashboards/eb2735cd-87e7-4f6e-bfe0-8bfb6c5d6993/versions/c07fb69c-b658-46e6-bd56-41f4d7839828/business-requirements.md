# Business requirements

Dashboard: Producto Stock Abajo 50
Business area: Deposito
Template: Dashboard en blanco

Goal:
Los productos abajo de 50

Requested requirements:
Objetivo: Los productos abajo de 50
Area: Deposito
Usuarios objetivo: Equipos operativos
Campos visibles: Codigo Producto, Producto, Volumen Material, Clase Material, Grupo, Division, Marca, Und Stock Deposito, Und Stock Transito, Vol Stock Deposito, Vol Stock Transito
Filtros: Periodo, Estado, Responsable
Datos auxiliares: dim_producto
Instrucciones extra: Preparar el dashboard para trabajo asistido por Codex: leer dashboard.manifest.json como contrato, usar allowedDataSources y editableStateKeys como unica fuente autorizada, consultar datos solo por DashboardManager SDK/MCP cuando este disponible, documentar supuestos de cruces entre datasets y dejar README.md con pasos de validacion e importacion desde GitHub.

ESTANDAR DE WIDGETS CORPORATIVOS: usar exclusivamente los widgets aprobados seleccionados: KPIs con estado (maximo 6), Barras comparativas (maximo 3), Ranking horizontal (maximo 2), Tabla analítica (maximo 2). No crear widgets, graficos o componentes visuales nuevos sin aprobacion administrativa. Respetar los datos necesarios, los usos y las restricciones del catalogo; mantener el estilo corporativo con tarjetas claras, estados semanticos y animacion sutil solo cuando aporte lectura.

<!-- dashboard-manager:data-contract:start -->
## Contrato de datos configurado en Dashboard Manager
- Datos auxiliares autorizados: dim_producto. Usá exclusivamente DashboardManager.getDataset o DashboardManager.lookupDataset para estas fuentes.
- Datos editables autorizados: ninguno.
- Actualizá dashboard.manifest.json con exactamente estos allowedDataSources y editableStateKeys.
- Los CSV o JSON locales deben vivir en data/; los snapshots JSON de payload, en payloads/. Declaralos en staticDataFiles y documentá origen, fecha y columnas en README.md.
- No uses localStorage como fuente compartida, no incrustes archivos grandes en JavaScript y no consumas archivos o APIs externas.
- No agregues fuentes, claves editables, permisos o conexiones fuera de este contrato.
<!-- dashboard-manager:data-contract:end -->

Acceptance:
- The dashboard must be readable by key users.
- The dashboard must use only allowed datasets and editable state keys.
- The dashboard must pass the Dashboard Manager package validator.