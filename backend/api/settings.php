<?php
/**
 * Settings API Controller
 * HoneyMilk Cakes and Steeze
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';

use HoneyMilk\Config\Database;
use HoneyMilk\Config\JWT;

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getConnection();

// GET: Public & Storefront Settings
if ($method === 'GET') {
    $stmt = $db->query("SELECT `key`, `value` FROM settings");
    $raw = $stmt->fetchAll();
    $settings = [];
    foreach ($raw as $r) {
        // Hide secret keys from public storefront output!
        if (str_contains($r['key'], 'secret')) {
            continue;
        }
        $settings[$r['key']] = $r['value'];
    }

    echo json_encode(['success' => true, 'data' => $settings]);
    exit;
}

// PUT / POST: Update Settings (Admin Only)
if ($method === 'PUT' || $method === 'POST') {
    JWT::requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $stmt = $db->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?");
    foreach ($input as $k => $v) {
        if (is_string($k)) {
            $val = is_array($v) ? json_encode($v) : (string)$v;
            $stmt->execute([$k, $val, $val]);
        }
    }

    echo json_encode(['success' => true, 'message' => 'Bakery settings updated successfully']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
