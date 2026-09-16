<?php
/**
 * Payments API Controller (Paystack Integration)
 * HoneyMilk Cakes and Steeze
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/paystack.php';

use HoneyMilk\Config\Database;
use HoneyMilk\Config\Paystack;

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$db = Database::getConnection();

// 1. INITIALIZE PAYMENT: POST /api/payments?action=initialize
if ($method === 'POST' && $action === 'initialize') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $orderNumber = trim($input['order_number'] ?? '');
    $callbackUrl = trim($input['callback_url'] ?? '');

    if (!$orderNumber) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Order number is required']);
        exit;
    }

    // Lookup order from database (NEVER trust frontend submitted amount!)
    $stmt = $db->prepare("SELECT id, order_number, customer_email, total, payment_status FROM orders WHERE order_number = ?");
    $stmt->execute([$orderNumber]);
    $order = $stmt->fetch();

    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }

    if ($order['payment_status'] === 'paid') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'This order has already been paid.']);
        exit;
    }

    // Paystack takes amount in kobo (1 Naira = 100 kobo)
    $amountInKobo = (int)round(((float)$order['total']) * 100);
    $reference = 'PAY_' . $order['order_number'] . '_' . bin2hex(random_bytes(4));

    // Update reference in order
    $db->prepare("UPDATE orders SET paystack_reference = ? WHERE id = ?")->execute([$reference, $order['id']]);

    // Record pending payment
    $payStmt = $db->prepare("INSERT INTO payments (order_id, payment_reference, gateway, amount, currency, status) VALUES (?, ?, 'paystack', ?, 'NGN', 'pending')");
    $payStmt->execute([$order['id'], $reference, $order['total']]);

    // Call Paystack
    $res = Paystack::initializeTransaction(
        $order['customer_email'],
        $amountInKobo,
        $reference,
        $callbackUrl ?: 'http://localhost:3000/order-confirmation/' . $orderNumber,
        ['order_number' => $orderNumber]
    );

    if (!empty($res['status']) && !empty($res['data']['authorization_url'])) {
        echo json_encode([
            'success' => true,
            'message' => 'Payment initialized',
            'data' => [
                'authorization_url' => $res['data']['authorization_url'],
                'access_code' => $res['data']['access_code'] ?? '',
                'reference' => $reference
            ]
        ]);
        exit;
    }

    http_response_code(502);
    echo json_encode(['success' => false, 'message' => $res['message'] ?? 'Could not initialize Paystack transaction']);
    exit;
}

// 2. VERIFY PAYMENT: GET /api/payments?action=verify&reference=...
if ($method === 'GET' && $action === 'verify') {
    $reference = trim($_GET['reference'] ?? '');

    if (!$reference) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Payment reference is required']);
        exit;
    }

    // Verify with Paystack server-side
    $verification = Paystack::verifyTransaction($reference);

    if (!empty($verification['status']) && ($verification['data']['status'] ?? '') === 'success') {
        // Find order associated with this reference
        $stmt = $db->prepare("SELECT id, order_number, total, payment_status FROM orders WHERE paystack_reference = ?");
        $stmt->execute([$reference]);
        $order = $stmt->fetch();

        if ($order) {
            // Update order payment status to 'paid' and order_status to 'confirmed'
            $db->prepare("UPDATE orders SET payment_status = 'paid', order_status = 'confirmed' WHERE id = ?")->execute([$order['id']]);

            // Update payments table
            $db->prepare("UPDATE payments SET status = 'success', paid_at = NOW(), gateway_response = ? WHERE payment_reference = ?")->execute([
                json_encode($verification['data']),
                $reference
            ]);

            // Status history
            $db->prepare("INSERT INTO order_status_history (order_id, status, notes, changed_by) VALUES (?, 'confirmed', 'Payment verified via Paystack', 'Paystack Gateway')")->execute([$order['id']]);

            echo json_encode([
                'success' => true,
                'message' => 'Payment verified successfully',
                'data' => [
                    'order_number' => $order['order_number'],
                    'payment_status' => 'paid',
                    'order_status' => 'confirmed'
                ]
            ]);
            exit;
        }
    }

    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Payment verification failed or status not successful',
        'details' => $verification
    ]);
    exit;
}

// 3. PAYSTACK WEBHOOK: POST /api/payments?action=webhook
if ($method === 'POST' && $action === 'webhook') {
    $input = file_get_contents('php://input');
    $signature = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';

    // Verify webhook signature if secret key configured
    if ($signature && !Paystack::verifyWebhookSignature($input, $signature)) {
        http_response_code(401);
        exit('Invalid signature');
    }

    $event = json_decode($input, true);
    if (!empty($event['event']) && $event['event'] === 'charge.success') {
        $reference = $event['data']['reference'] ?? '';
        if ($reference) {
            $stmt = $db->prepare("SELECT id FROM orders WHERE paystack_reference = ?");
            $stmt->execute([$reference]);
            $order = $stmt->fetch();

            if ($order) {
                $db->prepare("UPDATE orders SET payment_status = 'paid', order_status = 'confirmed' WHERE id = ?")->execute([$order['id']]);
                $db->prepare("UPDATE payments SET status = 'success', paid_at = NOW() WHERE payment_reference = ?")->execute([$reference]);
            }
        }
    }

    http_response_code(200);
    echo json_encode(['status' => 'success']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
