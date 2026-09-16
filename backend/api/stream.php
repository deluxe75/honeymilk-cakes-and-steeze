<?php
/**
 * Server-Sent Events (SSE) Real-Time Stream Controller
 * HoneyMilk Cakes and Steeze
 * Route: GET /api/orders/stream
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

use HoneyMilk\Config\Database;

// SSE headers
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Connection: keep-alive');
header('X-Accel-Buffering: no'); // Disable fastcgi buffering in Nginx

// Flush buffers
if (ob_get_level() > 0) {
    ob_end_clean();
}

$db = Database::getConnection();

// Send initial connection greeting
echo "event: connected\n";
echo "data: " . json_encode(['message' => 'Real-time order stream established with HoneyMilk Atelier', 'timestamp' => time()]) . "\n\n";
flush();

$lastId = isset($_SERVER['HTTP_LAST_EVENT_ID']) ? (int)$_SERVER['HTTP_LAST_EVENT_ID'] : 0;
if (!$lastId && isset($_GET['last_id'])) {
    $lastId = (int)$_GET['last_id'];
}

// Loop for up to 25 seconds before graceful disconnect/reconnect cycle
$startTime = time();
while (time() - $startTime < 25) {
    // Check for unread / new notifications
    $stmt = $db->prepare("SELECT id, type, title, message, data, created_at FROM notifications WHERE id > ? ORDER BY id ASC LIMIT 5");
    $stmt->execute([$lastId]);
    $notifications = $stmt->fetchAll();

    if (!empty($notifications)) {
        foreach ($notifications as $notif) {
            $lastId = (int)$notif['id'];
            $payload = [
                'id' => $notif['id'],
                'type' => $notif['type'],
                'title' => $notif['title'],
                'message' => $notif['message'],
                'data' => json_decode($notif['data'] ?? '{}', true),
                'created_at' => $notif['created_at']
            ];

            echo "id: {$lastId}\n";
            echo "event: " . ($notif['type'] === 'new_order' ? 'new_order' : 'notification') . "\n";
            echo "data: " . json_encode($payload) . "\n\n";
            flush();
        }
    } else {
        // Send heartbeat ping
        echo ": heartbeat\n\n";
        flush();
    }

    // If client disconnected, break
    if (connection_aborted()) {
        break;
    }

    sleep(2);
}
