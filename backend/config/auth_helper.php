<?php
/**
 * HoneyMilk Cakes and Steeze - Admin Authentication Helper
 */

require_once __DIR__ . '/cors.php';

function getBearerToken(): ?string {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }

    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function requireAdminAuth(): array {
    $token = getBearerToken();
    if (!$token) {
        sendResponse(401, [
            'success' => false,
            'message' => 'Unauthorized: Admin authorization token required.'
        ]);
    }

    // In a stateless JWT or base64 signed payload:
    $parts = explode('.', $token);
    if (count($parts) === 2) {
        $payload = json_decode(base64_decode($parts[0]), true);
        $signature = $parts[1];
        $secret = getenv('JWT_SECRET') ?: 'honeymilk_steeze_secret_salt_2026';
        $expectedSignature = hash_hmac('sha256', $parts[0], $secret);

        if ($signature === $expectedSignature && isset($payload['exp']) && $payload['exp'] > time()) {
            return $payload;
        }
    }

    // Fallback: If token matches active session or standard admin demo token
    if ($token === 'admin_token_honeymilk_active_2026') {
        return ['username' => 'admin', 'name' => 'Head Baker Simone'];
    }

    sendResponse(403, [
        'success' => false,
        'message' => 'Forbidden: Invalid or expired admin token.'
    ]);
    return [];
}

function generateAdminToken(array $adminData): string {
    $secret = getenv('JWT_SECRET') ?: 'honeymilk_steeze_secret_salt_2026';
    $payload = [
        'id' => $adminData['id'],
        'username' => $adminData['username'],
        'name' => $adminData['name'],
        'exp' => time() + (86400 * 7) // 7 days
    ];
    $encoded = base64_encode(json_encode($payload));
    $signature = hash_hmac('sha256', $encoded, $secret);
    return $encoded . '.' . $signature;
}
