# 🍽️ Sistema de Gestión Restaurante Buffet "La Hacienda" (.NET + PHP + MySQL)

Sistema integral de punto de venta, control de mesas y reflejo de pagos para restaurante de buffet, construido con una arquitectura desacoplada:
- **Frontend Web en PHP** ([`frontend-php/`](file:///c:/Users/sebastian%20salinas/Documents/hacienda/frontend-php))
- **Backend API REST en .NET** ([`backend-dotnet/HaciendaApi/`](file:///c:/Users/sebastian%20salinas/Documents/hacienda/backend-dotnet/HaciendaApi))
- **Base de Datos MySQL / MariaDB** ([`database/hacienda_buffet.sql`](file:///c:/Users/sebastian%20salinas/Documents/hacienda/database/hacienda_buffet.sql)) con respaldo automático en JSON local si MySQL no está encendido.

---

## 📋 Reglas de Negocio Configuradas

| Concepto | Detalle |
| :--- | :--- |
| **Buffet Adulto** | **$280.00 MXN** por persona |
| **Buffet Niño** | **$180.00 MXN** por niño |
| **Capacidades de Mesas** | **Mesas de 4, 6 y 10 personas** (12 mesas preconfiguradas: 5 de 4p, 4 de 6p y 3 de 10p) |
| **Consumo Extra** | Catálogo de bebidas y postres adicionales fuera del buffet |
| **Reflejo de Pagos** | Registro en tiempo real de cobros en **Efectivo**, **Tarjeta** y **Transferencia**, cálculo de cambio, generación de **Ticket 80mm** y **Corte de Caja** |

---

## 🔑 Credenciales de Acceso (Login)

| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` |
| **Cajero(a)** | `cajero` | `cajero123` |
| **Mesero(a)** | `mesero` | `mesero123` |

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción 1: Ejecución Rápida (1 Clic)
Haz doble clic en [`iniciar-sistema.bat`](file:///c:/Users/sebastian%20salinas/Documents/hacienda/iniciar-sistema.bat) o ejecuta en terminal:
```powershell
dotnet run --project backend-dotnet/HaciendaApi/HaciendaApi.csproj
```
Esto levantará la API REST en `http://localhost:5080` y podrás probar la interfaz completa en `http://localhost:5080/login.html`.

### Opción 2: Con XAMPP / Laragon (PHP + MySQL + .NET)
1. **Base de datos MySQL**:
   - Abre **phpMyAdmin** (`http://localhost/phpmyadmin`) e importa el archivo [`database/hacienda_buffet.sql`](file:///c:/Users/sebastian%20salinas/Documents/hacienda/database/hacienda_buffet.sql).
   - Ajusta usuario/contraseña de MySQL si es necesario en [`appsettings.json`](file:///c:/Users/sebastian%20salinas/Documents/hacienda/backend-dotnet/HaciendaApi/appsettings.json).
2. **Backend .NET**:
   - Inicia el proyecto `.NET` en el puerto `5080`.
3. **Frontend PHP**:
   - Copia o crea un enlace de la carpeta [`frontend-php`](file:///c:/Users/sebastian%20salinas/Documents/hacienda/frontend-php) dentro de `C:\xampp\htdocs\hacienda` (o ejecuta `php -S localhost:8080 -t frontend-php`).
   - Abre `http://localhost/hacienda/login.php` o `http://localhost:8080/login.php`.
