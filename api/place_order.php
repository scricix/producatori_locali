<?php
header('Content-Type: application/json');
require_once '../config/database.php';

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || empty($data['items'])) {
    echo json_encode(['success' => false, 'message' => 'Date comandă invalide']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Insert into orders table
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, customer_name, customer_phone, customer_email, delivery_address, delivery_county, delivery_city, total_amount, payment_method, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')");
    
    $stmt->execute([
        $data['user_id'] ?? null,
        $data['customer_name'],
        $data['customer_phone'],
        $data['customer_email'],
        $data['delivery_address'],
        $data['delivery_county'],
        $data['delivery_city'],
        $data['total_amount'],
        $data['payment_method'],
        $data['notes'] ?? ''
    ]);

    $order_id = $pdo->lastInsertId();

    // 2. Insert items into order_items table
    $stmtItems = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal, producer_email) VALUES (?, ?, ?, ?, ?, ?, ?)");

    foreach ($data['items'] as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $stmtItems->execute([
            $order_id,
            $item['id'],
            $item['title'],
            $item['price'],
            $item['quantity'],
            $subtotal,
            $item['producer_email'] ?? '' // Ensure this is stored in cart
        ]);
    }

    $pdo->commit();

    // --- EMAIL NOTIFICATIONS BY EMAIL ---
    try {
        require_once 'utils/emails.php';

        // 1. Send confirmation to customer
        $customerEmailContent = getCustomerOrderTemplate($data, $data['items']);
        sendOrderEmail($data['customer_email'], "Confirmare Comandă - Comanda #$order_id", $customerEmailContent);

        // 2. Group items by producer to send separate notifications
        $producerItems = [];
        foreach ($data['items'] as $item) {
            $email = $item['producer_email'] ?? '';
            if ($email) {
                if (!isset($producerItems[$email])) {
                    $producerItems[$email] = [];
                }
                $producerItems[$email][] = $item;
            }
        }

        foreach ($producerItems as $email => $items) {
            // Get producer name from DB (optional, but better)
            $pStmt = $pdo->prepare("SELECT name FROM users WHERE email = ?");
            $pStmt->execute([$email]);
            $pName = $pStmt->fetchColumn() ?: "Producător";

            $producerEmailContent = getProducerOrderTemplate($pName, $data, $items);
            sendOrderEmail($email, "Comandă Nouă Primită - Piața Locală", $producerEmailContent);
        }
    } catch (Exception $emailError) {
        error_log("Email error: " . $emailError->getMessage());
        // We don't fail the order if emails fail
    }
    // ------------------------------------

    echo json_encode([
        'success' => true, 
        'message' => 'Comandă plasată cu succes',
        'order_id' => $order_id
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Eroare la procesarea comenzii: ' . $e->getMessage()]);
}
?>
