<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Metodă invalidă']);
    exit;
}

$productName = $_POST['product_name'] ?? '';
$category = $_POST['category'] ?? '';
$description = $_POST['description'] ?? '';
$price = $_POST['price'] ?? 0;
$unit = $_POST['unit'] ?? 'bucată';
$stockQuantity = $_POST['stock_quantity'] ?? 0;
$county = $_POST['county'] ?? '';
$city = $_POST['city'] ?? '';
$userEmail = $_POST['user_email'] ?? '';
$producerName = $_POST['producer_name'] ?? '';

// Validation
if (empty($productName) || empty($category) || empty($price) || empty($userEmail)) {
    echo json_encode(['success' => false, 'message' => 'Câmpuri obligatorii lipsă']);
    exit;
}

try {
    // Get producer phone from users table
    $stmt = $pdo->prepare("SELECT phone FROM users WHERE user_email = ?");
    $stmt->execute([$userEmail]);
    $user = $stmt->fetch();
    $producerPhone = $user['phone'] ?? '';

    // Handle multiple image uploads
    $uploadedImages = [];
    $primaryImagePath = null;

    if (isset($_FILES['images']) && is_array($_FILES['images']['name'])) {
        $uploadDir = '../uploads/products/';
        
        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileCount = count($_FILES['images']['name']);
        
        for ($i = 0; $i < min($fileCount, 5); $i++) {
            if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                $fileExtension = pathinfo($_FILES['images']['name'][$i], PATHINFO_EXTENSION);
                $fileName = 'product_' . uniqid() . '_' . $i . '.' . $fileExtension;
                $targetPath = $uploadDir . $fileName;

                if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $targetPath)) {
                    $imagePath = 'uploads/products/' . $fileName;
                    $uploadedImages[] = $imagePath;
                    
                    // First successful image is primary
                    if ($primaryImagePath === null) {
                        $primaryImagePath = $imagePath;
                    }
                }
            }
        }
    }

    // Insert product
    $stmt = $pdo->prepare("
        INSERT INTO products (
            product_name, description, price, unit, stock_quantity, 
            category, producer_name, producer_phone, county, city, 
            image_path, user_email, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");

    $stmt->execute([
        $productName,
        $description,
        $price,
        $unit,
        $stockQuantity,
        $category,
        $producerName,
        $producerPhone,
        $county,
        $city,
        $primaryImagePath,
        $userEmail
    ]);

    $productId = $pdo->lastInsertId();

    // Insert all images into product_images table
    if (!empty($uploadedImages)) {
        $stmt = $pdo->prepare("
            INSERT INTO product_images (product_id, image_path, is_primary) 
            VALUES (?, ?, ?)
        ");

        foreach ($uploadedImages as $index => $imagePath) {
            $isPrimary = ($index === 0) ? 1 : 0;
            $stmt->execute([$productId, $imagePath, $isPrimary]);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Produs adăugat cu succes',
        'product_id' => $productId,
        'images_uploaded' => count($uploadedImages)
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Eroare la adăugarea produsului: ' . $e->getMessage()]);
}
?>
