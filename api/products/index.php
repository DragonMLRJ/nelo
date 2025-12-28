<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        if ($action === 'related') {
            getRelatedProducts();
        } else {
            getProducts();
        }
        break;
        
    case 'POST':
        createProduct();
        break;
        
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function getProducts() {
    try {
        $db = getDB();
        
        // Get query parameters
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;
        $minPrice = isset($_GET['minPrice']) ? (float)$_GET['minPrice'] : null;
        $maxPrice = isset($_GET['maxPrice']) ? (float)$_GET['maxPrice'] : null;
        $condition = $_GET['condition'] ?? null;
        $location = $_GET['location'] ?? null;
        $sortBy = $_GET['sortBy'] ?? 'newest'; // newest, price_low, price_high, popular
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $sql = "SELECT p.*, 
                       u.name as seller_name,
                       u.avatar as seller_avatar,
                       u.is_verified as seller_verified,
                       u.member_since as seller_member_since,
                       u.response_rate as seller_response_rate,
                       u.location as seller_location,
                       c.name as category_name,
                       c.slug as category_slug
                FROM products p
                JOIN users u ON p.seller_id = u.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE 1=1";
        
        $params = [];
        
        // Category filter (supports both old category field and new category_id)
        if ($category) {
            $sql .= " AND (p.category = ? OR c.slug = ?)";
            $params[] = $category;
            $params[] = $category;
        }
        
        // Search filter
        if ($search) {
            $sql .= " AND (p.title LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        // Price range filter
        if ($minPrice !== null) {
            $sql .= " AND p.price >= ?";
            $params[] = $minPrice;
        }
        
        if ($maxPrice !== null) {
            $sql .= " AND p.price <= ?";
            $params[] = $maxPrice;
        }
        
        // Condition filter
        if ($condition) {
            $sql .= " AND p.condition_status = ?";
            $params[] = $condition;
        }
        
        // Location filter
        if ($location) {
            $sql .= " AND (p.location LIKE ? OR u.location LIKE ?)";
            $locationTerm = "%$location%";
            $params[] = $locationTerm;
            $params[] = $locationTerm;
        }
        
        // Sorting
        switch ($sortBy) {
            case 'price_low':
                $sql .= " ORDER BY p.price ASC";
                break;
            case 'price_high':
                $sql .= " ORDER BY p.price DESC";
                break;
            case 'popular':
                $sql .= " ORDER BY p.likes DESC";
                break;
            case 'newest':
            default:
                $sql .= " ORDER BY p.posted_at DESC";
                break;
        }
        
        $sql .= " LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();
        
        // Format products to match frontend structure
        $formattedProducts = array_map(function($p) use ($db) {
            // Fetch extra images for this product
            $stmtImg = $db->prepare("SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC");
            $stmtImg->execute([$p['id']]);
            // Flatten to array of strings
            $extraImages = $stmtImg->fetchAll(PDO::FETCH_COLUMN);
            
            // Should primary 'image' be part of this gallery? 
            // Usually yes, let's merge them or just rely on 'product_images' if we decide to migrate primary there too.
            // For now, let's assume 'images' array contains all including primary if synced, or just extras.
            // Requirement: "Existing products.image column will be kept as the "thumbnail" or "primary image""
            
            // Let's create a full list starting with primary
            $allImages = []; 
            if (!empty($p['image'])) $allImages[] = $p['image'];
            $allImages = array_merge($allImages, $extraImages);
            
            return [
                'id' => (string)$p['id'],
                'title' => $p['title'],
                'price' => (float)$p['price'],
                'currency' => $p['currency'],
                'image' => $p['image'],
                'images' => $allImages, // New Field
                'category' => $p['category'] ?? $p['category_slug'],
                'categoryName' => $p['category_name'],
                'brand' => $p['brand'],
                'size' => $p['size'],
                'condition' => $p['condition_status'],
                'description' => $p['description'],
                'location' => $p['location'],
                'likes' => (int)$p['likes'],
                'postedAt' => date('Y-m-d H:i:s', strtotime($p['posted_at'])),
                'seller' => [
                    'id' => (string)$p['seller_id'],
                    'name' => $p['seller_name'],
                    'avatar' => $p['seller_avatar'],
                    'isVerified' => (bool)$p['seller_verified'],
                    'memberSince' => (string)$p['seller_member_since'],
                    'responseRate' => $p['seller_response_rate'],
                    'location' => $p['seller_location']
                ]
            ];
        }, $products);
        
        sendResponse([
            'success' => true,
            'products' => $formattedProducts,
            'count' => count($formattedProducts),
            'filters' => [
                'category' => $category,
                'search' => $search,
                'minPrice' => $minPrice,
                'maxPrice' => $maxPrice,
                'condition' => $condition,
                'location' => $location,
                'sortBy' => $sortBy
            ]
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function createProduct() {
    $data = getJsonInput();
    
    $required = ['title', 'price', 'seller_id'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            sendResponse(['error' => "Field '$field' is required"], 400);
        }
    }
    
    // Sanitize Input
    $cleanData = Validator::sanitize($data);

    try {
        $db = getDB();
        
        // If category slug is provided, get category_id
        $categoryId = null;
        if (!empty($cleanData['category'])) {
            $stmt = $db->prepare("SELECT id FROM categories WHERE slug = ?");
            $stmt->execute([$cleanData['category']]);
            $category = $stmt->fetch();
            if ($category) {
                $categoryId = $category['id'];
            }
        }
        
        $stmt = $db->prepare("
            INSERT INTO products (
                title, price, currency, image, category, category_id, brand, size, 
                condition_status, description, location, seller_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $cleanData['title'],
            $cleanData['price'],
            $cleanData['currency'] ?? 'XAF',
            $cleanData['image'] ?? null,
            $cleanData['category'] ?? null,
            $categoryId,
            $cleanData['brand'] ?? null,
            $cleanData['size'] ?? null,
            $cleanData['condition'] ?? 'Good',
            $cleanData['description'] ?? '',
            $cleanData['location'] ?? 'Brazzaville',
            $cleanData['seller_id']
        ]);
        
        $productId = $db->lastInsertId();
        
        // Handle multiple images if provided
        if (!empty($data['images']) && is_array($data['images'])) {
            $stmtImg = $db->prepare("INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)");
            foreach ($data['images'] as $index => $imgUrl) {
                // Skip the primary image if it's duplicated in the array, or just add all of them. 
                // Let's assume the frontend sends 'additional' images here.
                // Or if it sends ALL images, we should be careful.
                // Let's just insert all provided in 'images' array.
                if ($imgUrl !== $data['image']) { // Avoid duplicating primary if possible, or just allow it.
                     $stmtImg->execute([$productId, $imgUrl, $index]);
                }
            }
        }
        
        sendResponse([
            'success' => true,
            'product_id' => (string)$productId
        ], 201);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function getRelatedProducts() {
    $productId = $_GET['id'] ?? null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 4;
    
    if (!$productId) {
        sendResponse(['error' => 'Product ID is required'], 400);
    }
    
    try {
        $db = getDB();
        
        // Get current product details to find related items (by category)
        $stmt = $db->prepare("SELECT category_id, category, title FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        $product = $stmt->fetch();
        
        if (!$product) {
            sendResponse(['error' => 'Product not found'], 404);
        }
        
        // Determine category to search (prefer ID, fallback to slug)
        // If category_id is set, use it. If not, use category slug.
        $categoryId = $product['category_id'];
        $categorySlug = $product['category'];
        
        $sql = "SELECT p.*, 
                       u.name as seller_name,
                       u.avatar as seller_avatar,
                       u.is_verified as seller_verified,
                       c.name as category_name
                FROM products p
                JOIN users u ON p.seller_id = u.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id != ? 
                  AND (p.category_id = ? OR (p.category_id IS NULL AND p.category = ?))
                ORDER BY p.likes DESC, p.posted_at DESC 
                LIMIT ?";
                
        // Note: categoryId might be null, so check before executing
        // The SQL handles null check if we bind correctly but standard comparison with NULL yields unknown.
        // Actually, if category_id is null, the OR condition with category string handles it.
        // But if strict, we might need to handle the params array carefully.
        
        // Simplified Logic:
        // bind parameters: [id, categoryId, categorySlug, limit]
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$productId, $categoryId, $categorySlug, $limit]);
        $related = $stmt->fetchAll();
        
        // Format Logic
        $formatted = array_map(function($p) {
             return [
                'id' => (string)$p['id'],
                'title' => $p['title'],
                'price' => (float)$p['price'],
                'currency' => $p['currency'],
                'image' => $p['image'],
                'category' => $p['category'],
                'categoryName' => $p['category_name'] ?? $p['category'],
                'brand' => $p['brand'],
                'condition' => $p['condition_status'],
                'location' => $p['location'],
                'likes' => (int)$p['likes'],
                'postedAt' => date('Y-m-d H:i:s', strtotime($p['posted_at'])),
                'seller' => [
                    'id' => (string)$p['seller_id'],
                    'name' => $p['seller_name'],
                    'avatar' => $p['seller_avatar'],
                    'isVerified' => (bool)$p['seller_verified']
                ]
            ];
        }, $related);
        
        sendResponse([
            'success' => true,
            'products' => $formatted
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}
?>
