# Instrucciones para Codex

Este proyecto es un dashboard para Dashboard Manager.

Objetivo del dashboard:
Los productos abajo de 50

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

Datasets permitidos:
dim_producto

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
Nombre sugerido: Producto Stock Abajo 50
Objetivo: Los productos abajo de 50
Area de negocio: Deposito
Audiencia: Equipos operativos
La interfaz final del dashboard debe estar en espanol argentino.

## 3. Contexto de negocio
Crear una experiencia clara para Key Users, con KPIs, filtros, tablas y estados vacios comprensibles.
Crear el dashboard desde cero, manteniendo estructura simple y segura.

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
- Debe funcionar dentro de iframe sandbox.
- Usar exclusivamente widgets del catalogo corporativo declarados en las instrucciones. No crear widgets ni graficos nuevos sin aprobacion administrativa.

## 5. Datasets disponibles
- dim_producto (Productos): Productos y Stock
  Origen: POSTGRES_TABLE. Tabla/query: public.dim_producto
  Clave sugerida: producto_id. Columna descriptiva: producto.
  Columnas visibles: producto_id (Codigo Producto), producto (Producto), volumen_material (Volumen Material), clase_material (Clase Material), grupo (Grupo), division (Division), marca (Marca), und_stock_deposito (Und Stock Deposito), und_stock_transito (Und Stock Transito), vol_stock_deposito (Vol Stock Deposito), vol_stock_transito (Vol Stock Transito)
  Columnas buscables: producto_id, producto

## 6. Datos editables
No usar datos editables salvo que sea estrictamente necesario.
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
Metricas deseadas: No especificado.
Campos visibles: Codigo Producto, Producto, Volumen Material, Clase Material, Grupo, Division, Marca, Und Stock Deposito, Und Stock Transito, Vol Stock Deposito, Vol Stock Transito.
Campos editables: No especificado.
Filtros deseados: Periodo, Estado, Responsable.

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
  "name": "Producto Stock Abajo 50",
  "description": "Los productos abajo de 50",
  "entrypoint": "index.html",
  "version": "1.0.0",
  "requiresApi": true,
  "visualIdentity": "GRUPO_DISAL_LOCKED",
  "allowedDataSources": ["dim_producto"],
  "editableStateKeys": [],
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
- No hay datos editables seleccionados.

## Instrucciones adicionales del usuario
Preparar el dashboard para trabajo asistido por Codex: leer dashboard.manifest.json como contrato, usar allowedDataSources y editableStateKeys como unica fuente autorizada, consultar datos solo por DashboardManager SDK/MCP cuando este disponible, documentar supuestos de cruces entre datasets y dejar README.md con pasos de validacion e importacion desde GitHub.

ESTANDAR DE WIDGETS CORPORATIVOS: usar exclusivamente los widgets aprobados seleccionados: KPIs con estado (maximo 6), Barras comparativas (maximo 3), Ranking horizontal (maximo 2), Tabla analítica (maximo 2). No crear widgets, graficos o componentes visuales nuevos sin aprobacion administrativa. Respetar los datos necesarios, los usos y las restricciones del catalogo; mantener el estilo corporativo con tarjetas claras, estados semanticos y animacion sutil solo cuando aporte lectura.

## Advertencias a considerar
- [WARNING] No seleccionaste datos editables. El dashboard sera principalmente de lectura.
- [WARNING] El objetivo parece generico. Agrega mas contexto de negocio para mejorar el resultado.
- [INFO] No seleccionaste template base. El prompt pedira un dashboard desde cero.
- [WARNING] No cargaste metricas deseadas.

<!-- dashboard-manager:data-contract:start -->
## Contrato de datos configurado en Dashboard Manager
- Datos auxiliares autorizados: dim_producto. Usá exclusivamente DashboardManager.getDataset o DashboardManager.lookupDataset para estas fuentes.
- Datos editables autorizados: ninguno.
- Actualizá dashboard.manifest.json con exactamente estos allowedDataSources y editableStateKeys.
- Los CSV o JSON locales deben vivir en data/; los snapshots JSON de payload, en payloads/. Declaralos en staticDataFiles y documentá origen, fecha y columnas en README.md.
- No uses localStorage como fuente compartida, no incrustes archivos grandes en JavaScript y no consumas archivos o APIs externas.
- No agregues fuentes, claves editables, permisos o conexiones fuera de este contrato.
<!-- dashboard-manager:data-contract:end -->