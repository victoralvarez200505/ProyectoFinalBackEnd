# Script de limpieza para backend del proyecto
# Elimina archivos duplicados, no referenciados y marcadores temporales

$archivosAEliminar = @(
    "models\juego.js",
    "utils\transformer.js",
    "utils\validation.js",
    "funciones\juego.js",
    "models\.delete_marker",
    "utils\.delete_marker",
    "funciones\.delete_marker"
)

foreach ($archivo in $archivosAEliminar) {
    $ruta = Join-Path $PSScriptRoot $archivo
    if (Test-Path $ruta) {
        Remove-Item $ruta -Force
        Write-Host "Eliminado: $archivo"
    } else {
        Write-Host "No existe: $archivo"
    }
}

Write-Host "Limpieza completada."
