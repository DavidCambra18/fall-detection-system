# Script para permitir conexiones entrantes al backend Node.js
# Ejecuta esto como Administrador: Click derecho > Ejecutar con PowerShell

Write-Host "Configurando Firewall para ESP32..." -ForegroundColor Cyan

# Deshabilitar las reglas de bloqueo de Node.js
Write-Host "Deshabilitando reglas de bloqueo de Node.js..." -ForegroundColor Yellow
netsh advfirewall firewall set rule name="Node.js JavaScript Runtime" dir=in new enable=no

# Crear/actualizar regla para permitir puerto 3000
Write-Host "Permitiendo puerto 3000..." -ForegroundColor Yellow
netsh advfirewall firewall delete rule name="ESP32 Backend Port 3000" protocol=TCP localport=3000
netsh advfirewall firewall add rule name="ESP32 Backend Port 3000" dir=in action=allow protocol=TCP localport=3000 enable=yes profile=any

Write-Host "`n✓ Firewall configurado correctamente!" -ForegroundColor Green
Write-Host "Ahora intenta enviar datos desde el ESP32" -ForegroundColor Green

Pause
