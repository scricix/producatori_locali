<?php
header('Content-Type: application/json');
require_once '../config/database.php';

try {
    $category = isset($_GET['category']) ? $_GET['category'] : '';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12; // Default 12 products
    
    $query = "SELECT * FROM products WHERE 1=1";
    $params = [];

    if ($category) {
        $query .= " AND category = ?";
        $params[] = $category;
    }

    $producer_email = isset($_GET['producer_email']) ? $_GET['producer_email'] : '';
    if ($producer_email) {
        $query .= " AND user_email = ?";
        $params[] = $producer_email;
    }
    
    $query .= " ORDER BY id DESC LIMIT ?";
    
    // Bind limit explicitly
    $stmt = $pdo->prepare($query);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k + 1, $v);
    }
    $stmt->bindValue(count($params) + 1, $limit, PDO::PARAM_INT);
    
    $stmt->execute();
    $products = $stmt->fetchAll();
    
    // Transform data to match frontend expectations (normalize keys)
    $normalized_products = array_map(function($p) {
        return [
            'id' => $p['id'],
            'title' => $p['product_name'] ?? $p['title'] ?? 'Produs fără nume',
            'price' => $p['price'],
            'image' => $p['image_path'] ?? $p['image_url'] ?? 'imagini/placeholder.svg',
            'category' => $p['category'],
            'producer' => $p['producer_name'] ?? 'Producător Local',
            'producer_email' => $p['user_email'] ?? '',
            'city' => $p['city'] ?? '',
            'county' => $p['county'] ?? ''
        ];
    }, $products);

    echo json_encode(['success' => true, 'data' => $normalized_products]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
