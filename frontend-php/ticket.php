<?php
/**
 * Comprobante / Ticket de Pago Imprimible (80mm Térmico) - Sin Emojis
 * Obtiene los datos del pago desde la API REST en .NET
 */
require_once __DIR__ . '/api_client.php';

$pagoId = isset($_GET['id']) ? (int) $_GET['id'] : 1;
$res = llamarApiDotNet('GET', 'pagos/' . $pagoId);
$pago = ($res['ok'] && is_array($res['data'])) ? $res['data'] : null;
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket de Pago #<?= htmlspecialchars((string)$pagoId) ?> · La Hacienda Buffet</title>
    <link rel="preconnect" href="https://api.fontshare.com">
    <link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
    <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,800,700,600,500,400,300&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="ticket-body">
    <div class="ticket-actions no-print">
        <button class="btn btn-primary" onclick="window.print()">Imprimir Ticket 80mm</button>
        <button class="btn btn-outline" onclick="window.close()">Cerrar Ventana</button>
    </div>

    <div class="ticket-paper" id="ticketContainer">
        <?php if ($pago): ?>
            <div class="ticket-header">
                <img src="dist/hacienda-logo-black.png" alt="La Hacienda Restaurante" style="width: 72px; height: auto; display: block; margin: 0 auto 8px auto;" />
                <h2>LA HACIENDA RESTAURANTE</h2>
                <p>Buffet Familiar & Parrilla</p>
                <p>RFC: HBU261003MX9 · Tel: (55) 4829-1020</p>
                <div class="ticket-divider"></div>
                <p><strong>FOLIO TICKET: <?= htmlspecialchars($pago['folioTicket'] ?? '') ?></strong></p>
                <p>Fecha: <?= htmlspecialchars(substr(str_replace('T', ' ', $pago['fechaPago'] ?? ''), 0, 19)) ?></p>
                <p>Mesa: #<?= (int)($pago['mesaNumero'] ?? 0) ?> (Capacidad <?= (int)($pago['mesaCapacidad'] ?? 4) ?> personas)</p>
                <p>Cajero: <?= htmlspecialchars($pago['cajero'] ?? 'Caja General') ?></p>
            </div>

            <div class="ticket-divider"></div>

            <table class="ticket-table">
                <thead>
                    <tr>
                        <th>Cant.</th>
                        <th>Concepto</th>
                        <th class="text-right">Importe</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (($pago['cantAdultos'] ?? 0) > 0): ?>
                        <tr>
                            <td><?= (int)$pago['cantAdultos'] ?></td>
                            <td>Buffet Adulto ($280.00)</td>
                            <td class="text-right">$<?= number_format($pago['cantAdultos'] * 280, 2) ?></td>
                        </tr>
                    <?php endif; ?>

                    <?php if (($pago['cantNinos'] ?? 0) > 0): ?>
                        <tr>
                            <td><?= (int)$pago['cantNinos'] ?></td>
                            <td>Buffet Niño ($180.00)</td>
                            <td class="text-right">$<?= number_format($pago['cantNinos'] * 180, 2) ?></td>
                        </tr>
                    <?php endif; ?>

                    <?php if (!empty($pago['extras']) && is_array($pago['extras'])): ?>
                        <?php foreach ($pago['extras'] as $extra): ?>
                            <tr>
                                <td><?= (int)($extra['cantidad'] ?? 1) ?></td>
                                <td><?= htmlspecialchars($extra['nombreProducto'] ?? 'Extra') ?></td>
                                <td class="text-right">$<?= number_format((float)($extra['subtotal'] ?? 0), 2) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>

            <div class="ticket-divider"></div>

            <div class="ticket-totals">
                <div class="t-row">
                    <span>Subtotal Buffet:</span>
                    <span>$<?= number_format((float)($pago['subtotalBuffet'] ?? 0), 2) ?></span>
                </div>
                <div class="t-row">
                    <span>Subtotal Extras:</span>
                    <span>$<?= number_format((float)($pago['subtotalExtras'] ?? 0), 2) ?></span>
                </div>
                <?php if (($pago['descuento'] ?? 0) > 0): ?>
                    <div class="t-row">
                        <span>Descuento:</span>
                        <span>-$<?= number_format((float)$pago['descuento'], 2) ?></span>
                    </div>
                <?php endif; ?>
                <?php if (($pago['propina'] ?? 0) > 0): ?>
                    <div class="t-row">
                        <span>Propina:</span>
                        <span>$<?= number_format((float)$pago['propina'], 2) ?></span>
                    </div>
                <?php endif; ?>
                <div class="t-row t-grand">
                    <strong>TOTAL PAGADO:</strong>
                    <strong>$<?= number_format((float)($pago['montoTotal'] ?? 0), 2) ?></strong>
                </div>
                <div class="ticket-divider"></div>
                <div class="t-row">
                    <span>Método de Pago:</span>
                    <strong><?= htmlspecialchars($pago['metodoPago'] ?? 'Efectivo') ?></strong>
                </div>
                <div class="t-row">
                    <span>Monto Recibido:</span>
                    <span>$<?= number_format((float)($pago['montoRecibido'] ?? 0), 2) ?></span>
                </div>
                <div class="t-row">
                    <span>Cambio Entregado:</span>
                    <span>$<?= number_format((float)($pago['cambio'] ?? 0), 2) ?></span>
                </div>
            </div>

            <div class="ticket-divider"></div>
            <div class="ticket-footer">
                <p>Gracias por su visita a La Hacienda Buffet</p>
                <p>Buffet Adulto $280 · Buffet Niño $180</p>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
