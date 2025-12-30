# Script para empaquetar la extension de navegador
# Uso: .\package-extension.ps1

Write-Host "Empaquetando extension PingID Bingo..." -ForegroundColor Cyan

# Definir rutas
$extensionDir = $PSScriptRoot
$outputDir = Join-Path $extensionDir "dist"
$zipFile = Join-Path $outputDir "pingid-bingo-extension.zip"

# Crear directorio de salida si no existe
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Creado directorio dist/" -ForegroundColor Green
}

# Eliminar ZIP anterior si existe
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
    Write-Host "Eliminado ZIP anterior" -ForegroundColor Green
}

# Archivos a incluir en el paquete
$filesToInclude = @(
    "manifest.json",
    "config.js",
    "background.js",
    "content.js",
    "popup.html",
    "popup.js",
    "README.md",
    "INSTALL.md"
)

# Crear archivo temporal para el ZIP
$tempDir = Join-Path $env:TEMP "pingid-extension-temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar archivos al directorio temporal
foreach ($file in $filesToInclude) {
    $sourcePath = Join-Path $extensionDir $file
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath -Destination $tempDir
        Write-Host "  -> $file" -ForegroundColor Gray
    }
    else {
        Write-Host "  ! No encontrado: $file" -ForegroundColor Yellow
    }
}

# Copiar carpeta de iconos si existe
$iconsDir = Join-Path $extensionDir "icons"
if (Test-Path $iconsDir) {
    $tempIconsDir = Join-Path $tempDir "icons"
    Copy-Item $iconsDir -Destination $tempIconsDir -Recurse
    Write-Host "  -> icons/" -ForegroundColor Gray
}

# Crear archivo ZIP
Write-Host "`nComprimiendo archivos..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Limpiar directorio temporal
Remove-Item $tempDir -Recurse -Force

# Obtener tamaño del archivo
$fileSize = (Get-Item $zipFile).Length
$fileSizeKB = [math]::Round($fileSize / 1KB, 2)

Write-Host "`nExtension empaquetada exitosamente!" -ForegroundColor Green
Write-Host "Archivo: $zipFile" -ForegroundColor White
Write-Host "Tamaño: $fileSizeKB KB" -ForegroundColor White
Write-Host "`nEl archivo esta listo para distribuir desde tu web" -ForegroundColor Cyan
