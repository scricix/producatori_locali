<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Metodă invalidă']);
    exit;
}

$id = $_POST['id'] ?? '';
$productName = $_POST['product_name'] ?? '';
$category = $_POST['category'] ?? '';
$description = $_POST['description'] ?? '';
$price = $_POST['price'] ?? 0;
$unit = $_POST['unit'] ?? 'bucată';
$stockQuantity = $_POST['stock_quantity'] ?? 0;
$county = $_POST['county'] ?? '';
$city = $_POST['city'] ?? '';

if (empty($id) || empty($productName) || empty($category) || empty($price)) {
    echo json_encode(['success' => false, 'message' => 'Câmpuri obligatorii lipsă']);
    exit;
}

try {
    // Update product details
    $stmt = $pdo->prepare("
        UPDATE products 
        SET product_name = ?, description = ?, price = ?, unit = ?, stock_quantity = ?, 
            category = ?, county = ?, city = ?, updated_at = NOW()
        WHERE id = ?
    ");

    $stmt->execute([
        $productName,
        $description,
        $price,
        $unit,
        $stockQuantity,
        $category,
        $county,
        $city,
        $id
    ]);

    // Handle new image uploads if any
    if (isset($_FILES['images']) && is_array($_FILES['images']['name'])) {
        $uploadDir = '../uploads/products/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileCount = count($_FILES['images']['name']);
        for ($i = 0; $i < min($fileCount, 5); $i++) {
            if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                $fileExtension = pathinfo($_FILES['images']['name'][$i], PATHINFO_EXTENSION);
                $fileName = 'product_' . $id . '_' . uniqid() . '_' . $i . '.' . $fileExtension;
                $targetPath = $uploadDir . $fileName;

                if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $targetPath)) {
                    $imagePath = 'uploads/products/' . $fileName;
                    
                    // Insert into product_images
                    $stmt = $pdo->prepare("INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, ?)");
                    $stmt->execute([$id, $imagePath, 0]);

                    // Update main image in products table if it's currently empty
                    $stmt = $pdo->prepare("UPDATE products SET image_path = ? WHERE id = ? AND (image_path IS NULL OR image_path = '')");
                    $stmt->execute([$imagePath, $id]);
                }
            }
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Produs actualizat cu succes'
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Eroare la actualizarea produsului: ' . $e->getMessage()]);
}
?>
