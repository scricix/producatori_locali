<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    // Also handle GET for simplicity if needed, but DELETE is correct
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $id = $_GET['id'] ?? '';
    } else {
        echo json_encode(['success' => false, 'message' => 'Metodă invalidă']);
        exit;
    }
} else {
    $id = $_GET['id'] ?? '';
}

if (empty($id)) {
    echo json_encode(['success' => false, 'message' => 'ID lipsă']);
    exit;
}

try {
    // Delete product images physically (optional but good)
    $stmt = $pdo->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
    $stmt->execute([$id]);
    $images = $stmt->fetchAll();
    foreach ($images as $img) {
        $path = '../' . $img['image_path'];
        if (file_exists($path)) unlink($path);
    }

    // Delete from DB (cascading assumed if FK set up correctly)
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true, 'message' => 'Produs șters']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
