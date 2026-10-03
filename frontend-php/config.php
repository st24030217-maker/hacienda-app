<?php
/**
 * Configuración Global Blindada - Sistema de Gestión Restaurante Buffet "La Hacienda"
 * Arquitectura: Frontend en PHP + Backend API REST en .NET
 */
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.use_strict_mode', '1');
    ini_set('session.cookie_httponly', '1');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
    session_start();
}

// Cabeceras de Seguridad HTTP
if (!headers_sent()) {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
}

// Token CSRF criptográfico de sesión
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

date_default_timezone_set('America/Mexico_City');

// URL base de la API REST en .NET
define('DOTNET_API_URL', getenv('DOTNET_API_URL') ?: 'http://localhost:5080/api');

// Precios Oficiales del Buffet
define('PRECIO_BUFFET_ADULTO', 280.00);
define('PRECIO_BUFFET_NINO', 180.00);

// Capacidades de mesas disponibles en el restaurante
define('CAPACIDADES_MESAS', [4, 6, 10]);

// Nombre del Restaurante
define('RESTAURANTE_NOMBRE', 'La Hacienda Restaurante');
define('RESTAURANTE_SUBTITULO', 'Sistema de Gestión de Mesas, Buffet y Reflejo de Pagos');
