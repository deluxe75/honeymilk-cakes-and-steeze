<?php
/**
 * Reviews & Contact Messages API Controller
 * HoneyMilk Cakes and Steeze
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

use HoneyMilk\Config\Database;

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getConnection();
$endpoint = $_GET['endpoint'] ?? 'reviews';

// REVIEWS
if ($endpoint === 'reviews') {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT id, author_name, location, rating, comment, created_at FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC LIMIT 50");
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $name = trim($input['author_name'] ?? '');
        $location = trim($input['location'] ?? 'Lagos, Nigeria');
        $rating = max(1, min(5, (int)($input['rating'] ?? 5)));
        $comment = trim($input['comment'] ?? '');

        if (!$name || !$comment) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name and review text are required.']);
            exit;
        }

        $stmt = $db->prepare("INSERT INTO reviews (author_name, location, rating, comment, is_approved) VALUES (?, ?, ?, ?, 1)");
        $stmt->execute([$name, $location, $rating, $comment]);

        echo json_encode(['success' => true, 'message' => 'Thank you for your review!']);
        exit;
    }
}

// CONTACT
if ($endpoint === 'contact' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $subject = trim($input['subject'] ?? 'Website Inquiry');
    $message = trim($input['message'] ?? '');

    if (!$name || !$email || !$message) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Name, email, and message are required.']);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $subject, $message]);

    echo json_encode(['success' => true, 'message' => 'Your note has been received by our Soho concierge.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
