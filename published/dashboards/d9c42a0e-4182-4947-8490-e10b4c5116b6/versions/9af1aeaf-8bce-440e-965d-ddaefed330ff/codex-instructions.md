# Instrucciones para Codex

Este proyecto es un dashboard para Dashboard Manager.

Objetivo del dashboard:
Dashboard de calidad para concentra los indicadores y decisiones que requieren una lectura rapida.

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
- Mantener obligatoriamente visualIdentity: GRUPO_DISAL_LOCKED en dashboard.manifest.json.
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


MCP corporativo:
- El MCP ofrece solamente list_datasets, describe_dataset, sample_dataset y query_dataset con limites de lectura.
- No usar ni inferir datasets fuera de la lista permitida.
- Los datos reales se consultan en runtime exclusivamente por DashboardManager.getDataset o DashboardManager.lookupDataset.

Datos editables permitidos:


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
Nombre sugerido: Resumen ejecutivo de Calidad
Objetivo: Dashboard de calidad para concentra los indicadores y decisiones que requieren una lectura rapida.
Area de negocio: Calidad
Audiencia: Key Users y responsables de calidad.
La interfaz final del dashboard debe estar en espanol argentino.

## 3. Contexto de negocio
Crear una experiencia clara para Key Users, con KPIs, filtros, tablas y estados vacios comprensibles.
Usar como referencia conceptual el template activo 'Resumen ejecutivo de Calidad' (calidad-resumen-ejecutivo): Dashboard de calidad para concentra los indicadores y decisiones que requieren una lectura rapida.

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
- clientes_catalogo (Clientes): Catalogo corporativo de clientes proveniente de public.dim_cliente.
  Origen: POSTGRES_TABLE. Tabla/query: public.dim_cliente
  Clave sugerida: cliente_id. Columna descriptiva: cliente.
  Columnas visibles: cliente_id (Cliente Id), unidad_negocio (Unidad Negocio), organizacion_venta (Organizacion Venta), canal (Canal), oficina_venta (Oficina Venta), jefatura (Jefatura), zona (Zona), vendedor (Vendedor), grupo_comercial (Grupo Comercial), cliente (Cliente), updated_at (Updated At), grupo_cliente (Grupo Cliente)
  Columnas buscables: cliente_id, unidad_negocio, organizacion_venta, canal, oficina_venta, jefatura, zona, vendedor, grupo_comercial, cliente, grupo_cliente

## 6. Datos editables
Usar editableStateKeys permitidos: acciones_calidad, comentarios, acciones.
Si guardas datos editables, cargar primero con getState, guardar con setState usando version, y tratar conflictos HTTP 409.

## 7. Archivos CSV y payloads versionados
Si el análisis necesita archivos locales, subirlos al mismo workspace GitHub: CSV o JSON de negocio en data/ y snapshots iniciales de datos editables en payloads/ como JSON.
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
Metricas deseadas: Resumen ejecutivo de Calidad, Cumplimiento de Calidad, Desvio relevante de Calidad, Acciones pendientes de Calidad.
Campos visibles: Resumen ejecutivo de Calidad, Cumplimiento de Calidad, Desvio relevante de Calidad, Acciones pendientes de Calidad, calidad_lotes, areas_catalogo, Cliente Id, Unidad Negocio, Organizacion Venta, Canal, Oficina Venta, Jefatura.
Campos editables: acciones_calidad, comentarios, acciones.
Filtros deseados: Periodo, Categoria, Estado, Responsable.

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
  "name": "Resumen ejecutivo de Calidad",
  "description": "Dashboard de calidad para concentra los indicadores y decisiones que requieren una lectura rapida.",
  "entrypoint": "index.html",
  "version": "1.0.0",
  "requiresApi": true,
  "visualIdentity": "GRUPO_DISAL_LOCKED",
  "allowedDataSources": ["clientes_catalogo"],
  "editableStateKeys": ["acciones_calidad", "comentarios", "acciones"],
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
- EditableStateKeys listados en el manifest.

## Instrucciones adicionales del usuario
Usar el paquete corporativo Resumen ejecutivo de Calidad. Incluir KPIs: Resumen ejecutivo de Calidad, Cumplimiento de Calidad, Desvio relevante de Calidad, Acciones pendientes de Calidad. Incluir insights: Prioridades de Calidad, Desvios a revisar en resumen ejecutivo, Responsables con acciones, Oportunidades de mejora.
ESTANDAR DE WIDGETS CORPORATIVOS: usar exclusivamente los widgets aprobados seleccionados: KPIs con estado (maximo 6), Burbujas de prioridad (maximo 1), Pareto 80/20 (maximo 1), Matriz de riesgo (maximo 1), Heatmap de actividad (maximo 1), Timeline (maximo 1), Tabla analítica (maximo 2). No crear widgets, graficos o componentes visuales nuevos sin aprobacion administrativa. Respetar los datos necesarios, los usos y las restricciones del catalogo; mantener el estilo corporativo con tarjetas claras, estados semanticos y animacion sutil solo cuando aporte lectura.
Preparar el dashboard para trabajo asistido por Codex: leer dashboard.manifest.json como contrato, usar allowedDataSources y editableStateKeys como unica fuente autorizada, consultar datos solo por DashboardManager SDK/MCP cuando este disponible, documentar supuestos de cruces entre datasets y dejar README.md con pasos de validacion e importacion desde GitHub.

ESTANDAR DE WIDGETS CORPORATIVOS: usar exclusivamente los widgets aprobados seleccionados: KPIs con estado (maximo 6), Burbujas de prioridad (maximo 1), Pareto 80/20 (maximo 1), Matriz de riesgo (maximo 1), Heatmap de actividad (maximo 1), Timeline (maximo 1), Tabla analítica (maximo 2). No crear widgets, graficos o componentes visuales nuevos sin aprobacion administrativa. Respetar los datos necesarios, los usos y las restricciones del catalogo; mantener el estilo corporativo con tarjetas claras, estados semanticos y animacion sutil solo cuando aporte lectura.