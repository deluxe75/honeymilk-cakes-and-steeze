<?php
/**
 * Orders API Controller
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

$action = $_GET['action'] ?? '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// 1. PUBLIC TRACKING: GET /api/orders?action=track&order_number=...&phone=...
if ($method === 'GET' && $action === 'track') {
    $orderNumber = trim($_GET['order_number'] ?? '');
    $phone = trim($_GET['phone'] ?? '');

    if (!$orderNumber) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Order reference number is required']);
        exit;
    }

    $sql = "SELECT id, order_number, customer_name, customer_email, customer_phone, delivery_type, delivery_state, delivery_city, delivery_area, delivery_address, delivery_date, delivery_time_slot, cake_message, special_instructions, subtotal, delivery_fee, total, payment_method, payment_status, order_status, created_at FROM orders WHERE order_number = ?";
    $params = [$orderNumber];

    if ($phone) {
        $sql .= " AND (customer_phone LIKE ? OR customer_whatsapp LIKE ?)";
        $params[] = "%{$phone}%";
        $params[] = "%{$phone}%";
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $order = $stmt->fetch();

    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found matching this reference and phone number.']);
        exit;
    }

    // Fetch order items
    $itemStmt = $db->prepare("SELECT product_name, size_selected, flavor_selected, filling_selected, addons_selected, unit_price, quantity, subtotal, item_notes FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$order['id']]);
    $order['items'] = $itemStmt->fetchAll();

    // Fetch status history timeline
    $histStmt = $db->prepare("SELECT status, notes, created_at FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC");
    $histStmt->execute([$order['id']]);
    $order['timeline'] = $histStmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $order]);
    exit;
}

// 2. CREATE ORDER: POST /api/orders
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $customerName = trim($input['customer_name'] ?? '');
    $customerEmail = trim($input['customer_email'] ?? '');
    $customerPhone = trim($input['customer_phone'] ?? '');
    $customerWhatsapp = trim($input['customer_whatsapp'] ?? $customerPhone);
    $items = $input['items'] ?? [];
    $deliveryType = ($input['delivery_type'] ?? 'pickup') === 'delivery' ? 'delivery' : 'pickup';
    $deliveryState = trim($input['delivery_state'] ?? 'Lagos');
    $deliveryCity = trim($input['delivery_city'] ?? 'Lagos');
    $deliveryArea = trim($input['delivery_area'] ?? '');
    $deliveryAddress = trim($input['delivery_address'] ?? '');
    $deliveryDate = trim($input['delivery_date'] ?? date('Y-m-d', strtotime('+1 day')));
    $deliveryTimeSlot = trim($input['delivery_time_slot'] ?? '12:00 PM - 3:00 PM');
    $cakeMessage = trim($input['cake_message'] ?? '');
    $specialInstructions = trim($input['special_instructions'] ?? '');
    $paymentMethod = $input['payment_method'] ?? 'paystack';

    // 1. Validation
    if (!$customerName || !$customerEmail || !$customerPhone) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Customer name, email, and phone number are required.']);
        exit;
    }

    if (empty($items) || !is_array($items)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Cart must contain at least one cake.']);
        exit;
    }

    if ($deliveryType === 'delivery' && !$deliveryAddress) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Full street address is required for courier delivery.']);
        exit;
    }

    // 2. SERVER-SIDE PRICE RECALCULATION
    // Never trust frontend submitted total!
    $calculatedSubtotal = 0.0;
    $validatedItems = [];

    // Pre-fetch all catalog products & options
    $prodStmt = $db->query("SELECT id, name, base_price, is_available FROM products");
    $catalogProducts = [];
    foreach ($prodStmt->fetchAll() as $row) {
        $catalogProducts[$row['id']] = $row;
    }

    $optStmt = $db->query("SELECT id, option_type, name, price_adjustment FROM product_options");
    $optionsMap = [];
    foreach ($optStmt->fetchAll() as $opt) {
        $optionsMap[strtolower($opt['option_type']) . '_' . strtolower(trim($opt['name']))] = (float)$opt['price_adjustment'];
    }

    foreach ($items as $item) {
        $prodId = (int)($item['product_id'] ?? 0);
        $qty = max(1, (int)($item['quantity'] ?? 1));
        
        $basePrice = 45000.00; // fallback base price
        $prodName = $item['name'] ?? 'Artisan Steeze Cake';

        if (isset($catalogProducts[$prodId])) {
            $basePrice = (float)$catalogProducts[$prodId]['base_price'];
            $prodName = $catalogProducts[$prodId]['name'];
        }

        // Adjust for size
        $sizeAdjustment = 0.0;
        $sizeName = trim($item['size'] ?? '6 Inch (6 - 8 Servings)');
        $sizeKey = 'size_' . strtolower($sizeName);
        if (isset($optionsMap[$sizeKey])) {
            $sizeAdjustment = $optionsMap[$sizeKey];
        } elseif (preg_match('/8\s*inch/i', $sizeName)) {
            $sizeAdjustment = 18000.0;
        } elseif (preg_match('/10\s*inch/i', $sizeName)) {
            $sizeAdjustment = 36000.0;
        } elseif (preg_match('/12\s*inch/i', $sizeName)) {
            $sizeAdjustment = 58000.0;
        }

        // Adjust for flavor
        $flavorAdjustment = 0.0;
        $flavorName = trim($item['flavor'] ?? 'Signature Wildflower Honeycomb');
        $flavorKey = 'flavor_' . strtolower($flavorName);
        if (isset($optionsMap[$flavorKey])) {
            $flavorAdjustment = $optionsMap[$flavorKey];
        }

        // Adjust for filling
        $fillingAdjustment = 0.0;
        $fillingName = trim($item['filling'] ?? 'Whipped Honeycomb Buttercream');
        $fillingKey = 'filling_' . strtolower($fillingName);
        if (isset($optionsMap[$fillingKey])) {
            $fillingAdjustment = $optionsMap[$fillingKey];
        }

        // Adjust for add-ons
        $addonsAdjustment = 0.0;
        $addonsList = is_array($item['addons'] ?? null) ? $item['addons'] : [];
        foreach ($addonsList as $addon) {
            $addonKey = 'addon_' . strtolower(trim($addon));
            if (isset($optionsMap[$addonKey])) {
                $addonsAdjustment += $optionsMap[$addonKey];
            } else {
                $addonsAdjustment += 3500.0; // standard addon estimate
            }
        }

        $unitPrice = $basePrice + $sizeAdjustment + $flavorAdjustment + $fillingAdjustment + $addonsAdjustment;
        $itemSubtotal = $unitPrice * $qty;
        $calculatedSubtotal += $itemSubtotal;

        $validatedItems[] = [
            'product_id' => $prodId ?: null,
            'product_name' => $prodName,
            'size_selected' => $sizeName,
            'flavor_selected' => $flavorName,
            'filling_selected' => $fillingName,
            'addons_selected' => json_encode($addonsList),
            'unit_price' => $unitPrice,
            'quantity' => $qty,
            'subtotal' => $itemSubtotal,
            'item_notes' => trim($item['notes'] ?? '') ?: null
        ];
    }

    // Delivery fee calculation
    $deliveryFee = 0.0;
    if ($deliveryType === 'delivery') {
        $deliveryFee = ($calculatedSubtotal >= 90000.00) ? 0.0 : 4500.00;
    }

    $finalTotal = $calculatedSubtotal + $deliveryFee;

    // 3. GENERATE UNIQUE ORDER NUMBER: #HM-YYYYMMDD-XXX
    $todayDate = date('Ymd');
    $randDigits = str_pad((string)random_int(1, 999), 3, '0', STR_PAD_LEFT);
    $orderNumber = "HM-{$todayDate}-{$randDigits}";

    // Check collision
    $cntStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE order_number = ?");
    $cntStmt->execute([$orderNumber]);
    if ($cntStmt->fetchColumn() > 0) {
        $orderNumber = "HM-{$todayDate}-" . str_pad((string)random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
    }

    $initialPaymentStatus = ($paymentMethod === 'cash_on_pickup' || $paymentMethod === 'cash_on_delivery') 
        ? 'cash_on_delivery' 
        : 'pending';

    // 4. TRANSACTION INSERT
    $db->beginTransaction();

    try {
        $stmt = $db->prepare("
            INSERT INTO orders (
                order_number, customer_name, customer_email, customer_phone, customer_whatsapp,
                delivery_type, delivery_state, delivery_city, delivery_area, delivery_address,
                delivery_date, delivery_time_slot, cake_message, special_instructions,
                subtotal, delivery_fee, total, payment_method, payment_status, order_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        ");

        $stmt->execute([
            $orderNumber, $customerName, $customerEmail, $customerPhone, $customerWhatsapp,
            $deliveryType, $deliveryState, $deliveryCity, $deliveryArea, $deliveryAddress,
            $deliveryDate, $deliveryTimeSlot, $cakeMessage, $specialInstructions,
            $calculatedSubtotal, $deliveryFee, $finalTotal, $paymentMethod, $initialPaymentStatus
        ]);

        $orderId = (int)$db->lastInsertId();

        // Insert order items
        $itemInsert = $db->prepare("
            INSERT INTO order_items (
                order_id, product_id, product_name, size_selected, flavor_selected,
                filling_selected, addons_selected, unit_price, quantity, subtotal, item_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        foreach ($validatedItems as $vItem) {
            $itemInsert->execute([
                $orderId, $vItem['product_id'], $vItem['product_name'], $vItem['size_selected'],
                $vItem['flavor_selected'], $vItem['filling_selected'], $vItem['addons_selected'],
                $vItem['unit_price'], $vItem['quantity'], $vItem['subtotal'], $vItem['item_notes']
            ]);
        }

        // Insert initial status history
        $histInsert = $db->prepare("INSERT INTO order_status_history (order_id, status, notes, changed_by) VALUES (?, 'pending', 'Order placed by customer', 'Customer')");
        $histInsert->execute([$orderId]);

        // Insert into notifications for real-time SSE stream!
        $notifStmt = $db->prepare("
            INSERT INTO notifications (type, title, message, data) 
            VALUES ('new_order', ?, ?, ?)
        ");
        $notifData = json_encode([
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'customer_name' => $customerName,
            'total' => $finalTotal,
            'delivery_type' => $deliveryType
        ]);
        $notifStmt->execute([
            "New Order Received — #{$orderNumber}",
            "{$customerName} placed an order for ₦" . number_format($finalTotal, 2),
            $notifData
        ]);

        $db->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Order created successfully with server-verified pricing',
            'data' => [
                'id' => $orderId,
                'order_number' => $orderNumber,
                'customer_name' => $customerName,
                'subtotal' => $calculatedSubtotal,
                'delivery_fee' => $deliveryFee,
                'total' => $finalTotal,
                'payment_method' => $paymentMethod,
                'payment_status' => $initialPaymentStatus,
                'order_status' => 'pending'
            ]
        ]);
        exit;

    } catch (\Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save order: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 3. ADMIN LIST ORDERS: GET /api/orders (Requires Admin)
if ($method === 'GET' && !$id) {
    JWT::requireAdmin();

    $status = $_GET['status'] ?? null;
    $paymentStatus = $_GET['payment_status'] ?? null;
    $search = $_GET['search'] ?? null;

    $sql = "SELECT * FROM orders WHERE 1=1";
    $params = [];

    if ($status && $status !== 'all') {
        $sql .= " AND order_status = ?";
        $params[] = $status;
    }

    if ($paymentStatus && $paymentStatus !== 'all') {
        $sql .= " AND payment_status = ?";
        $params[] = $paymentStatus;
    }

    if ($search) {
        $sql .= " AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }

    $sql .= " ORDER BY created_at DESC LIMIT 100";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    // Attach items to each order
    foreach ($orders as &$ord) {
        $itemsStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemsStmt->execute([$ord['id']]);
        $ord['items'] = $itemsStmt->fetchAll();
    }

    echo json_encode([
        'success' => true,
        'count' => count($orders),
        'data' => $orders
    ]);
    exit;
}

// 4. ADMIN UPDATE STATUS: PATCH /api/orders?id=... (Requires Admin)
if (($method === 'PATCH' || $method === 'PUT') && $id) {
    JWT::requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $orderStatus = $input['order_status'] ?? null;
    $paymentStatus = $input['payment_status'] ?? null;
    $notes = trim($input['notes'] ?? 'Status updated by bakery admin');

    if ($orderStatus) {
        $stmt = $db->prepare("UPDATE orders SET order_status = ? WHERE id = ?");
        $stmt->execute([$orderStatus, $id]);

        $histStmt = $db->prepare("INSERT INTO order_status_history (order_id, status, notes, changed_by) VALUES (?, ?, ?, 'Admin')");
        $histStmt->execute([$id, $orderStatus, $notes]);
    }

    if ($paymentStatus) {
        $stmt = $db->prepare("UPDATE orders SET payment_status = ? WHERE id = ?");
        $stmt->execute([$paymentStatus, $id]);
    }

    echo json_encode(['success' => true, 'message' => 'Order status updated']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
