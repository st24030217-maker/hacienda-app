<?php
/**
 * Pantalla de Login en PHP Blindada - Sistema de Gestión Restaurante Buffet "La Hacienda"
 * Sin emojis · Tipografía Anton & Satoshi · Protección CSRF + Regeneración de Sesión
 */
require_once __DIR__ . '/api_client.php';

if (isset($_SESSION['usuario'])) {
    header('Location: index.php');
    exit;
}

$error = '';
$username = 'admin';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $csrfRecibido = $_POST['csrf_token'] ?? '';
    $csrfSesion   = $_SESSION['csrf_token'] ?? '';

    if ($csrfSesion === '' || !hash_equals($csrfSesion, $csrfRecibido)) {
        $error = 'Token de seguridad CSRF inválido. Recarga la página e intenta nuevamente.';
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if ($username === '' || $password === '') {
            $error = 'Por favor ingresa tu usuario y contraseña.';
        } else {
            $res = llamarApiDotNet('POST', 'auth/login', [
                'username' => $username,
                'password' => $password
            ]);

            if ($res['ok'] && !empty($res['data']['exito'])) {
                session_regenerate_id(true);
                $_SESSION['usuario'] = $res['data']['usuario'];
                $_SESSION['token'] = $res['data']['token'] ?? '';
                $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
                header('Location: index.php');
                exit;
            } else {
                $error = $res['data']['mensaje'] ?? $res['error'] ?? 'Credenciales inválidas.';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso Operativo · La Hacienda Restaurante (.NET + PHP)</title>
    <link rel="preconnect" href="https://api.fontshare.com">
    <link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
    <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,800,700,600,500,400,300&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Satoshi', system-ui, sans-serif; }
        h1, h2, .font-anton { font-family: 'Anton', sans-serif; letter-spacing: 0.04em; }
    </style>
</head>
<body class="min-h-screen bg-black text-white flex items-center justify-center p-4">
    <div class="w-full max-w-md rounded-3xl bg-neutral-950/90 backdrop-blur-2xl border border-white/20 p-8 shadow-2xl">
        <div class="flex flex-col items-center text-center mb-6">
            <img src="dist/hacienda-logo.png" alt="La Hacienda Restaurante" class="w-28 h-32 object-contain mb-3" />
            <span class="px-3 py-0.5 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                FRONTEND PHP + API REST .NET + MYSQL
            </span>
            <h1 class="text-2xl uppercase mt-2">La Hacienda Restaurante</h1>
            <p class="text-xs text-neutral-400 mt-1">Control de Mesas (4, 6 y 10), Buffet y Reflejo de Pagos</p>
        </div>

        <div class="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/5 border border-white/15 mb-6 text-center">
            <div>
                <span class="text-[10px] uppercase text-neutral-400 block">Buffet Adulto</span>
                <strong class="text-sm text-white">$<?= number_format(PRECIO_BUFFET_ADULTO, 2) ?></strong>
            </div>
            <div class="border-x border-white/15">
                <span class="text-[10px] uppercase text-neutral-400 block">Buffet Niño</span>
                <strong class="text-sm text-white">$<?= number_format(PRECIO_BUFFET_NINO, 2) ?></strong>
            </div>
            <div>
                <span class="text-[10px] uppercase text-neutral-400 block">23 Mesas</span>
                <strong class="text-xs text-white">4 · 6 · 10 Pers.</strong>
            </div>
        </div>

        <?php if ($error !== ''): ?>
            <div class="mb-4 p-3 rounded-xl bg-white/10 border border-white/30 text-white text-xs">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="login.php" class="space-y-4">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">
            <div>
                <label class="block text-[11px] uppercase text-neutral-300 mb-1 font-bold">Usuario Operativo</label>
                <input type="text" id="username" name="username" value="<?= htmlspecialchars($username) ?>" required
                    class="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white">
            </div>
            <div>
                <label class="block text-[11px] uppercase text-neutral-300 mb-1 font-bold">Contraseña</label>
                <input type="password" id="password" name="password" value="" placeholder="Contraseña" required
                    class="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white">
            </div>
            <button type="submit" class="w-full py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-sm transition cursor-pointer">
                Ingresar al Centro de Operaciones
            </button>
        </form>
    </div>
</body>
</html>
