<?php
/**
 * Custom Orders API Controller (Bespoke Commissions)
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
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// 1. CREATE CUSTOM INQUIRY: POST /api/custom-orders
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $whatsapp = trim($input['whatsapp'] ?? $phone);
    $occasion = trim($input['occasion'] ?? 'Celebration');
    $cakeType = trim($input['cake_type'] ?? 'Sculptural Centerpiece');
    $flavor = trim($input['flavor'] ?? 'Signature Honeycomb');
    $size = trim($input['size'] ?? '2-Tier (35-50 Servings)');
    $filling = trim($input['filling'] ?? '');
    $theme = trim($input['theme'] ?? '');
    $color = trim($input['color_preference'] ?? '');
    $servings = (int)($input['servings'] ?? 25);
    $budget = trim($input['budget'] ?? '₦80,000 - ₦150,000');
    $eventDate = trim($input['event_date'] ?? date('Y-m-d', strtotime('+7 days')));
    $cakeMessage = trim($input['cake_message'] ?? '');
    $notes = trim($input['notes'] ?? '');
    $images = is_array($input['reference_images'] ?? null) ? $input['reference_images'] : [];
    if (!empty($input['reference_image']) && empty($images)) {
        $images[] = $input['reference_image'];
    }

    if (!$name || !$email || !$phone || !$occasion || !$eventDate) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Name, email, phone, occasion, and event date are required.']);
        exit;
    }

    $refId = 'CUSTOM-HM-' . str_pad((string)random_int(100, 99999), 6, '0', STR_PAD_LEFT);

    $db->beginTransaction();
    try {
        $stmt = $db->prepare("
            INSERT INTO custom_orders (
                reference_id, name, email, phone, whatsapp, occasion, cake_type,
                flavor, size, filling, theme, color_preference, servings,
                budget_tier, event_date, cake_message, special_instructions, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
        ");

        $stmt->execute([
            $refId, $name, $email, $phone, $whatsapp, $occasion, $cakeType,
            $flavor, $size, $filling, $theme, $color, $servings,
            $budget, $eventDate, $cakeMessage, $notes
        ]);

        $customId = (int)$db->lastInsertId();

        // Save reference images
        $imgStmt = $db->prepare("INSERT INTO custom_order_images (custom_order_id, image_url) VALUES (?, ?)");
        foreach ($images as $img) {
            if (is_string($img) && trim($img)) {
                $imgStmt->execute([$customId, trim($img)]);
            }
        }

        // Add real-time notification
        $notifStmt = $db->prepare("INSERT INTO notifications (type, title, message, data) VALUES ('new_custom_order', ?, ?, ?)");
        $notifStmt->execute([
            "New Custom Commission — #{$refId}",
            "{$name} requested a bespoke {$occasion} cake for {$eventDate}",
            json_encode(['custom_id' => $customId, 'reference_id' => $refId, 'name' => $name, 'occasion' => $occasion])
        ]);

        $db->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Custom cake commission received successfully with Steeze!',
            'data' => [
                'id' => $customId,
                'reference_id' => $refId,
                'name' => $name,
                'occasion' => $occasion,
                'event_date' => $eventDate
            ]
        ]);
        exit;

    } catch (\Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to record custom request: ' . $e->getMessage()]);
        exit;
    }
}

// 2. ADMIN LIST CUSTOM INQUIRIES: GET /api/custom-orders
if ($method === 'GET') {
    JWT::requireAdmin();

    $stmt = $db->query("SELECT * FROM custom_orders ORDER BY created_at DESC LIMIT 100");
    $list = $stmt->fetchAll();

    foreach ($list as &$item) {
        $imgStmt = $db->prepare("SELECT image_url FROM custom_order_images WHERE custom_order_id = ?");
        $imgStmt->execute([$item['id']]);
        $item['images'] = array_column($imgStmt->fetchAll(), 'image_url');
    }

    echo json_encode(['success' => true, 'count' => count($list), 'data' => $list]);
    exit;
}

// 3. ADMIN UPDATE STATUS & QUOTE: PATCH /api/custom-orders?id=...
if (($method === 'PATCH' || $method === 'PUT') && $id) {
    JWT::requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $status = $input['status'] ?? null;
    $estimatedPrice = isset($input['estimated_price']) ? (float)$input['estimated_price'] : null;

    if ($status && $estimatedPrice !== null) {
        $stmt = $db->prepare("UPDATE custom_orders SET status = ?, estimated_price = ? WHERE id = ?");
        $stmt->execute([$status, $estimatedPrice, $id]);
    } elseif ($status) {
        $stmt = $db->prepare("UPDATE custom_orders SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
    }

    echo json_encode(['success' => true, 'message' => 'Custom inquiry updated']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
