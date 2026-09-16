<?php
/**
 * Products API Controller
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

// Parse ID from query params or path
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// GET: Single product or list
if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare("SELECT p.*, c.name AS category_name FROM products p LEFT JOIN product_categories c ON p.category_id = c.id WHERE p.id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();

        if (!$product) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Cake product not found']);
            exit;
        }

        // Fetch options
        $optStmt = $db->prepare("SELECT id, option_type, name, price_adjustment, is_default FROM product_options WHERE product_id IS NULL OR product_id = ? ORDER BY sort_order ASC");
        $optStmt->execute([$id]);
        $options = $optStmt->fetchAll();

        $product['options'] = [
            'sizes' => array_values(array_filter($options, fn($o) => $o['option_type'] === 'size')),
            'flavors' => array_values(array_filter($options, fn($o) => $o['option_type'] === 'flavor')),
            'fillings' => array_values(array_filter($options, fn($o) => $o['option_type'] === 'filling')),
            'addons' => array_values(array_filter($options, fn($o) => $o['option_type'] === 'addon'))
        ];

        echo json_encode(['success' => true, 'data' => $product]);
        exit;
    }

    // List products with query filtering
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $minPrice = isset($_GET['min_price']) ? (float)$_GET['min_price'] : null;
    $maxPrice = isset($_GET['max_price']) ? (float)$_GET['max_price'] : null;
    $sortBy = $_GET['sort_by'] ?? 'featured'; // 'price_asc', 'price_desc', 'name', 'featured'

    $sql = "SELECT p.*, c.name AS category_name FROM products p LEFT JOIN product_categories c ON p.category_id = c.id WHERE 1=1";
    $params = [];

    if ($category && $category !== 'all') {
        $sql .= " AND p.category_slug = ?";
        $params[] = $category;
    }

    if ($search) {
        $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }

    if ($minPrice !== null) {
        $sql .= " AND p.base_price >= ?";
        $params[] = $minPrice;
    }

    if ($maxPrice !== null) {
        $sql .= " AND p.base_price <= ?";
        $params[] = $maxPrice;
    }

    // Sorting
    switch ($sortBy) {
        case 'price_asc':
            $sql .= " ORDER BY p.base_price ASC";
            break;
        case 'price_desc':
            $sql .= " ORDER BY p.base_price DESC";
            break;
        case 'name':
            $sql .= " ORDER BY p.name ASC";
            break;
        case 'featured':
        default:
            $sql .= " ORDER BY p.is_featured DESC, p.is_popular DESC, p.id ASC";
            break;
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'count' => count($products),
        'data' => $products
    ]);
    exit;
}

// POST: Admin Create Cake
if ($method === 'POST') {
    JWT::requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $name = trim($input['name'] ?? '');
    $slug = trim($input['slug'] ?? strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
    $categorySlug = trim($input['category_slug'] ?? 'celebration');
    $description = trim($input['description'] ?? '');
    $basePrice = (float)($input['base_price'] ?? 45000);
    $imageUrl = trim($input['image_url'] ?? '');
    $badge = trim($input['badge'] ?? '');
    $isFeatured = !empty($input['is_featured']) ? 1 : 0;
    $isPopular = !empty($input['is_popular']) ? 1 : 0;
    $isAvailable = isset($input['is_available']) ? (int)$input['is_available'] : 1;

    if (!$name || !$basePrice || !$imageUrl) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Cake name, base price, and image URL are required.']);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO products (name, slug, category_slug, description, base_price, image_url, badge, is_featured, is_popular, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $slug, $categorySlug, $description, $basePrice, $imageUrl, $badge, $isFeatured, $isPopular, $isAvailable]);
    $newId = (int)$db->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Cake created successfully in catalog',
        'data' => ['id' => $newId, 'name' => $name, 'slug' => $slug]
    ]);
    exit;
}

// PUT: Admin Update Cake
if ($method === 'PUT' && $id) {
    JWT::requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $stmt = $db->prepare("UPDATE products SET name = ?, category_slug = ?, description = ?, base_price = ?, image_url = ?, badge = ?, is_featured = ?, is_popular = ?, is_available = ? WHERE id = ?");
    $stmt->execute([
        $input['name'],
        $input['category_slug'],
        $input['description'],
        (float)$input['base_price'],
        $input['image_url'],
        $input['badge'] ?? null,
        !empty($input['is_featured']) ? 1 : 0,
        !empty($input['is_popular']) ? 1 : 0,
        isset($input['is_available']) ? (int)$input['is_available'] : 1,
        $id
    ]);

    echo json_encode(['success' => true, 'message' => 'Cake updated successfully']);
    exit;
}

// DELETE: Admin Delete Cake
if ($method === 'DELETE' && $id) {
    JWT::requireAdmin();
    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true, 'message' => 'Cake removed from catalog']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
