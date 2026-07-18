# Contrato de datos del dashboard

## Fuentes administradas
Datasets autorizados por Dashboard Manager: 

Datos editables autorizados: 

## Archivos locales versionados
- `data/`: CSV o JSON de negocio, agregados y sin datos sensibles.
- `payloads/`: JSON de snapshots iniciales para desarrollo o demostracion.
- Cada archivo consumido por la interfaz debe declararse en `staticDataFiles` de `dashboard.manifest.json`.
- El dashboard puede leer esos archivos como recursos estaticos relativos del workspace. No reemplazan datasets administrados ni datos editables.
- No usar `localStorage` como fuente compartida, ni URLs externas, ni secretos.

Para cada archivo, documentar en `README.md`: origen, fecha de actualizacion, columnas, nivel de agregacion, responsable y como regenerarlo.