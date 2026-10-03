<?php
/**
 * Panel Principal en PHP + Componentes React (Aceternity / Anime.js / Three.js / Lucide)
 * Conectado a la API REST en .NET (Puerto 5080) y MySQL
 * Sin emojis · Tipografía Anton & Satoshi
 */
require_once __DIR__ . '/api_client.php';

$usuarioSesion = $_SESSION['usuario'] ?? null;

$cssFiles = glob(__DIR__ . '/dist/assets/*.css') ?: [];
$jsFiles  = glob(__DIR__ . '/dist/assets/index-*.js') ?: [];
$cssHref  = !empty($cssFiles) ? 'dist/assets/' . basename($cssFiles[0]) : '';
$jsSrc    = !empty($jsFiles)  ? 'dist/assets/' . basename($jsFiles[0])  : '';
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#000000" />
    <title>La Hacienda Buffet · Sistema de Gestión (.NET + PHP + React)</title>
    <link rel="preconnect" href="https://api.fontshare.com">
    <link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
    <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,800,700,600,500,400,300&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
    <?php if ($cssHref !== ''): ?>
        <link rel="stylesheet" crossorigin href="<?= htmlspecialchars($cssHref) ?>">
    <?php endif; ?>
</head>
<body class="bg-black text-white min-h-screen antialiased selection:bg-white selection:text-black font-sans">
    <div id="root"></div>

    <script>
        window.APP_CONFIG = {
            apiUrl: <?= json_encode(DOTNET_API_URL) ?>,
            proxyUrl: "api_client.php?proxy=1&endpoint=",
            precioAdulto: <?= json_encode(PRECIO_BUFFET_ADULTO) ?>,
            precioNino: <?= json_encode(PRECIO_BUFFET_NINO) ?>
        };
        <?php if ($usuarioSesion): ?>
        localStorage.setItem('hacienda_user', <?= json_encode(json_encode($usuarioSesion)) ?>);
        <?php endif; ?>
    </script>

    <?php if ($jsSrc !== ''): ?>
        <script type="module" crossorigin src="<?= htmlspecialchars($jsSrc) ?>"></script>
    <?php endif; ?>
</body>
</html>
