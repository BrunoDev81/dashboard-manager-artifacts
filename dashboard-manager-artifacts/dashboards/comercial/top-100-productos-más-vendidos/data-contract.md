# Contrato de datos del dashboard

## Fuentes administradas
Datasets autorizados por Dashboard Manager: productos_catalogo, pedidos

Datos editables autorizados: comentarios, acciones, metas

## Archivos corporativos gobernados
- Consultar `governed-files.manifest.json` para conocer el activo estable, la version aprobada y su SHA-256.
- El repositorio conserva el contrato, no una copia libre del archivo. El contenido se lee con `dashboard_manager_read_editable_file` usando `assetId` y `versionId`.
- Una version nueva no sustituye la activa hasta su aprobacion. Restaurar una version anterior no cambia la referencia estable usada por el dashboard.

## Archivos locales versionados
- `data/`: CSV o JSON de negocio, agregados y sin datos sensibles.
- `payloads/`: JSON de snapshots iniciales para desarrollo o demostracion.
- Cada archivo consumido por la interfaz debe declararse en `staticDataFiles` de `dashboard.manifest.json`.
- El dashboard puede leer esos archivos como recursos estaticos relativos del workspace. No reemplazan datasets administrados ni datos editables.
- No usar `localStorage` como fuente compartida, ni URLs externas, ni secretos.

Para cada archivo, documentar en `README.md`: origen, fecha de actualizacion, columnas, nivel de agregacion, responsable y como regenerarlo.