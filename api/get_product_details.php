<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$id = $_GET['id'] ?? 0;

if (empty($id)) {
    echo json_encode(['success' => false, 'message' => 'ID produs lipsă']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch();

    if ($product) {
        // Fetch additional images
        $stmtImg = $pdo->prepare("SELECT image_path, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC");
        $stmtImg->execute([$id]);
        $product['images'] = $stmtImg->fetchAll();

        echo json_encode([
            'success' => true,
            'data' => $product
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Produs negăsit']);
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Eroare server']);
}
?>
