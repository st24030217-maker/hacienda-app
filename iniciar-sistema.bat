@echo off
title La Hacienda Buffet - Backend .NET API + React UI + PHP
echo ============================================================================
echo   SISTEMA DE GESTION RESTAURANTE BUFFET "LA HACIENDA" (.NET + PHP + REACT)
echo   Precios Buffet: Adulto $280.00 MXN  ^|  Nino $180.00 MXN
echo   Mesas: 4, 6 y 10 personas
echo ============================================================================
echo.
echo [1/2] Iniciando API REST en .NET en http://localhost:5080 ...
echo [2/2] Abriendo interfaz interactiva en http://localhost:5080 ...
echo.
start "" "http://localhost:5080"
dotnet run --project "%~dp0backend-dotnet\HaciendaApi\HaciendaApi.csproj"
pause
