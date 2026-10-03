<?php
/**
 * Cliente HTTP de PHP Blindado para consumir la API REST en .NET
 */
require_once __DIR__ . '/config.php';

function validarRutaEndpoint(string $endpoint): bool
{
    if (strpos($endpoint, '..') !== false || strpos($endpoint, '//') !== false || strpos($endpoint, '@') !== false) {
        return false;
    }
    return (bool) preg_match('/^[a-zA-Z0-9\/_-]+(\?[a-zA-Z0-9=&_%-]+)?$/', $endpoint);
}

function llamarApiDotNet(string $metodo, string $endpoint, ?array $datos = null): array
{
    $endpointLimpio = ltrim($endpoint, '/');
    if (!validarRutaEndpoint($endpointLimpio)) {
        return [
            'ok' => false,
            'status' => 400,
            'error' => 'Ruta de endpoint no autorizada.'
        ];
    }

    $url = rtrim(DOTNET_API_URL, '/') . '/' . $endpointLimpio;
    $metodo = strtoupper($metodo);
    if (!in_array($metodo, ['GET', 'POST', 'PUT', 'DELETE'], true)) {
        return [
            'ok' => false,
            'status' => 405,
            'error' => 'Método HTTP no permitido.'
        ];
    }

    // Reenviar token de autorización desde sesión PHP o cabecera entrante
    $bearerToken = $_SESSION['token'] ?? '';
    if ($bearerToken === '' && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
        if (stripos($_SERVER['HTTP_AUTHORIZATION'], 'Bearer ') === 0) {
            $bearerToken = trim(substr($_SERVER['HTTP_AUTHORIZATION'], 7));
        }
    }

    // Usar cURL si está habilitado en PHP
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        $headers = ['Accept: application/json'];
        if ($bearerToken !== '') {
            $headers[] = 'Authorization: Bearer ' . $bearerToken;
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $metodo);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);

        if ($datos !== null && in_array($metodo, ['POST', 'PUT'], true)) {
            $jsonPayload = json_encode($datos, JSON_UNESCAPED_UNICODE);
            $headers[] = 'Content-Type: application/json';
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload);
        }

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $respuesta = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($respuesta === false || $httpCode === 0) {
            return [
                'ok' => false,
                'status' => 503,
                'error' => 'No se pudo conectar con el servidor .NET en ' . DOTNET_API_URL . ' (' . $error . ')'
            ];
        }

        $decoded = json_decode($respuesta, true);
        return [
            'ok' => ($httpCode >= 200 && $httpCode < 300),
            'status' => $httpCode,
            'data' => $decoded ?? $respuesta
        ];
    }

    // Respaldo con file_get_contents + stream_context si cURL no está activo
    $headerStr = "Accept: application/json\r\nContent-Type: application/json\r\n";
    if ($bearerToken !== '') {
        $headerStr .= "Authorization: Bearer " . $bearerToken . "\r\n";
    }

    $opcionesHttp = [
        'method' => $metodo,
        'header' => $headerStr,
        'timeout' => 5,
        'ignore_errors' => true
    ];

    if ($datos !== null && in_array($metodo, ['POST', 'PUT'], true)) {
        $opcionesHttp['content'] = json_encode($datos, JSON_UNESCAPED_UNICODE);
    }

    $contexto = stream_context_create(['http' => $opcionesHttp]);
    $respuesta = @file_get_contents($url, false, $contexto);

    if ($respuesta === false) {
        return [
            'ok' => false,
            'status' => 503,
            'error' => 'No se pudo conectar con la API .NET en ' . DOTNET_API_URL
        ];
    }

    $statusLine = $http_response_header[0] ?? 'HTTP/1.1 200 OK';
    preg_match('{HTTP\/\S*\s(\d{3})}', $statusLine, $match);
    $httpCode = isset($match[1]) ? (int) $match[1] : 200;

    return [
        'ok' => ($httpCode >= 200 && $httpCode < 300),
        'status' => $httpCode,
        'data' => json_decode($respuesta, true)
    ];
}

// Si este archivo se invoca como puente AJAX desde el navegador (?proxy=1&endpoint=...)
if (isset($_GET['proxy']) && $_GET['proxy'] === '1') {
    header('Content-Type: application/json; charset=utf-8');
    $endpoint = $_GET['endpoint'] ?? 'status';
    $metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $rawBody = file_get_contents('php://input');
    $payload = !empty($rawBody) ? json_decode($rawBody, true) : null;

    $resultado = llamarApiDotNet($metodo, $endpoint, $payload);
    http_response_code($resultado['status'] ?? 200);
    echo json_encode($resultado['data'] ?? ['exito' => false, 'mensaje' => $resultado['error'] ?? 'Error de conexión'], JSON_UNESCAPED_UNICODE);
    exit;
}
