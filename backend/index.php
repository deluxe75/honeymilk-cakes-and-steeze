<?php
/**
 * Master REST Router
 * HoneyMilk Cakes and Steeze
 */

declare(strict_types=1);

require_once __DIR__ . '/config/cors.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^/backend#', '', $uri);
$uri = preg_replace('#^/api#', '', $uri);
$uri = trim($uri, '/');

$segments = explode('/', $uri);
$resource = $segments[0] ?? '';
$subResource = $segments[1] ?? '';

// Dispatcher
switch ($resource) {
    case 'products':
        if ($subResource && is_numeric($subResource)) {
            $_GET['id'] = $subResource;
        }
        require __DIR__ . '/api/products.php';
        break;

    case 'orders':
        if ($subResource === 'stream') {
            require __DIR__ . '/api/stream.php';
        } elseif ($subResource === 'track') {
            $_GET['action'] = 'track';
            require __DIR__ . '/api/orders.php';
        } elseif ($subResource && is_numeric($subResource)) {
            $_GET['id'] = $subResource;
            require __DIR__ . '/api/orders.php';
        } else {
            require __DIR__ . '/api/orders.php';
        }
        break;

    case 'custom-orders':
        if ($subResource && is_numeric($subResource)) {
            $_GET['id'] = $subResource;
        }
        require __DIR__ . '/api/custom_orders.php';
        break;

    case 'auth':
        if ($subResource) {
            $_GET['action'] = $subResource;
        }
        require __DIR__ . '/api/auth.php';
        break;

    case 'payments':
        if ($subResource) {
            $_GET['action'] = $subResource;
        }
        require __DIR__ . '/api/payments.php';
        break;

    case 'upload':
        require __DIR__ . '/api/upload.php';
        break;

    case 'settings':
        require __DIR__ . '/api/settings.php';
        break;

    case 'reviews':
        $_GET['endpoint'] = 'reviews';
        require __DIR__ . '/api/reviews.php';
        break;

    case 'contact':
        $_GET['endpoint'] = 'contact';
        require __DIR__ . '/api/reviews.php';
        break;

    default:
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'online',
            'api' => 'HoneyMilk Cakes and Steeze REST API',
            'version' => '1.0.0',
            'docs' => [
                'GET /api/products' => 'Browse products with filtering',
                'POST /api/orders' => 'Place real customer order',
                'GET /api/orders/track' => 'Public customer tracking by order_number & phone',
                'GET /api/orders/stream' => 'Real-time Server-Sent Events stream',
                'POST /api/payments/initialize' => 'Paystack transaction initialization',
                'GET /api/payments/verify/:ref' => 'Server-side payment verification',
                'POST /api/custom-orders' => 'Bespoke custom cake commission'
            ]
        ]);
        break;
}
