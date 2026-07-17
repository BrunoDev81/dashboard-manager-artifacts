# Instrucciones para Codex

Este proyecto es un dashboard para Dashboard Manager.

Objetivo del dashboard:
1

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
# Contrato obligatorio para Codex - Dashboard Manager

## Dashboard
- Nombre: 1
- Área: 1
- Objetivo: 1

## Resultado esperado
Construí un dashboard corporativo estático, claro y responsive, listo para ser versionado en GitHub e importado en Dashboard Manager.
La interfaz final debe estar en español argentino y contemplar estados de carga, error y sin datos.

## Reglas obligatorias de plataforma
- Entregar únicamente archivos estáticos: index.html, style.css, app.js, dashboard.manifest.json y README.md.
- Usar HTML, CSS y JavaScript puro. No usar React, Vue, Angular, Node, Python, PHP ni backend propio.
- Incluir exactamente <script src="/dashboard-sdk.js"></script> en index.html.
- Debe poder ejecutarse dentro de un iframe sandbox.
- No usar CDN, scripts remotos, eval, dependencias externas, fetch directo a /api ni servicios externos.
- No conectarse directo a PostgreSQL ni a ninguna base de datos.
- No incluir ni solicitar contraseñas, tokens, secretos, connection strings, datos personales o endpoints internos.
- Para datos, usar solamente DashboardManager.getDataset y DashboardManager.lookupDataset cuando el manifest autorice datasets.
- Para datos editables, usar solamente DashboardManager.getState, setState y getStateHistory cuando el manifest autorice editableStateKeys; tratar conflictos de versión.
- Para archivos locales, usar únicamente CSV o JSON versionados en GitHub dentro de data/ y snapshots JSON dentro de payloads/; declararlos en staticDataFiles del manifest.
- No incrustar archivos grandes en app.js, no usar localStorage como base de datos y no descargar datos desde URLs externas.
- Documentar en README.md el origen, fecha, columnas, nivel de agregación y responsable de cada CSV o payload para que el dashboard sea compartible.
- No inventar datasets, relaciones, permisos ni datos. Si faltan fuentes, mostrar una experiencia útil con estado vacío y documentar lo necesario en README.md.

## Identidad visual obligatoria
- Mantener visualIdentity: GRUPO_DISAL_LOCKED en dashboard.manifest.json.
- Mostrar la marca GRUPO DISAL con fondo claro azul muy sutil (#eef7ff o #f9fcff), tarjetas blancas, bordes #cfe2f5, azul #0072bc y celeste #00a6df.
- Usar verde #009a44 solo para exito, ambar #f3b51b solo para alertas y rojo #c43e4b solo para errores o riesgos.
- Nunca usar fondos negros u oscuros, ni declarar background o background-color con black, #000, #000000, #111, #111111, #111827, #0f172a o #1f2937 en HTML, CSS o JavaScript. Esto incluye tooltips, modales, graficos, hovers y fallbacks.
- No incluir prefers-color-scheme: dark, color-scheme: dark, clases .dark ni un modo oscuro alternativo.
- Antes de entregar, revisar index.html, style.css y app.js para confirmar que no contienen declaraciones de fondo oscuro prohibidas.

## Manifest obligatorio
Crear dashboard.manifest.json con entrypoint index.html, versión 1.0.0, requiresApi: true, visualIdentity: GRUPO_DISAL_LOCKED, allowedDataSources: [], editableStateKeys: [] y staticDataFiles: [] hasta que Dashboard Manager los habilite o se agreguen archivos versionados.

## Calidad y entrega
Mantener una interfaz ejecutiva y accesible, con contraste suficiente, tablas legibles y filtros solo cuando aporten valor.
Documentar en README.md la estructura, supuestos, fuentes autorizadas y pasos de validación/importación desde GitHub.
Devolver el contenido completo de cada archivo. Antes de terminar, validar que el manifest y los archivos cumplan este contrato.
