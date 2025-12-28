<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $action = $_GET['action'] ?? 'list';
        
        if ($action === 'list') {
            getCategories();
        } elseif ($action === 'tree') {
            getCategoriesTree();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

/**
 * Get all categories (flat list)
 */
function getCategories() {
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            SELECT 
                c.id,
                c.name,
                c.slug,
                c.parent_id,
                c.icon,
                c.display_order,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id, c.name, c.slug, c.parent_id, c.icon, c.display_order
            ORDER BY c.display_order ASC, c.name ASC
        ");
        
        $stmt->execute();
        $categories = $stmt->fetchAll();
        
        $result = [];
        foreach ($categories as $cat) {
            $result[] = [
                'id' => (int)$cat['id'],
                'name' => $cat['name'],
                'slug' => $cat['slug'],
                'parentId' => $cat['parent_id'] ? (int)$cat['parent_id'] : null,
                'icon' => $cat['icon'],
                'displayOrder' => (int)$cat['display_order'],
                'productCount' => (int)$cat['product_count']
            ];
        }
        
        sendResponse([
            'success' => true,
            'categories' => $result
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Get categories as hierarchical tree
 */
function getCategoriesTree() {
    try {
        $db = getDB();
        
        // Get all categories
        $stmt = $db->prepare("
            SELECT 
                c.id,
                c.name,
                c.slug,
                c.parent_id,
                c.icon,
                c.display_order,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id, c.name, c.slug, c.parent_id, c.icon, c.display_order
            ORDER BY c.display_order ASC, c.name ASC
        ");
        
        $stmt->execute();
        $categories = $stmt->fetchAll();
        
        // Build tree structure
        $categoriesById = [];
        $tree = [];
        
        // First pass: create all category objects
        foreach ($categories as $cat) {
            $categoriesById[$cat['id']] = [
                'id' => (int)$cat['id'],
                'name' => $cat['name'],
                'slug' => $cat['slug'],
                'parentId' => $cat['parent_id'] ? (int)$cat['parent_id'] : null,
                'icon' => $cat['icon'],
                'displayOrder' => (int)$cat['display_order'],
                'productCount' => (int)$cat['product_count'],
                'children' => []
            ];
        }
        
        // Second pass: build tree
        foreach ($categoriesById as $id => $category) {
            if ($category['parentId'] === null) {
                $tree[] = &$categoriesById[$id];
            } else {
                if (isset($categoriesById[$category['parentId']])) {
                    $categoriesById[$category['parentId']]['children'][] = &$categoriesById[$id];
                }
            }
        }
        
        sendResponse([
            'success' => true,
            'categories' => $tree
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Helper function to send JSON response
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
