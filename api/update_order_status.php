<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$order_id = $_POST['order_id'] ?? '';
$status = $_POST['status'] ?? '';
$producer_email = $_POST['producer_email'] ?? '';

if (empty($order_id) || empty($status) || empty($producer_email)) {
    echo json_encode(['success' => false, 'message' => 'Date incomplete']);
    exit;
}

try {
    // Check if the order contains items for this producer
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM order_items WHERE order_id = ? AND producer_email = ?");
    $checkStmt->execute([$order_id, $producer_email]);
    if ($checkStmt->fetchColumn() == 0) {
        echo json_encode(['success' => false, 'message' => 'Nu aveți permisiunea de a modifica această comandă']);
        exit;
    }

    // Update status
    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$status, $order_id]);

    // Send email notification to customer
    try {
        require_once 'utils/emails.php';
        
        // Fetch customer details
        $stmtOrder = $pdo->prepare("SELECT customer_name, customer_email FROM orders WHERE id = ?");
        $stmtOrder->execute([$order_id]);
        $order = $stmtOrder->fetch();
        
        if ($order) {
            $emailContent = getStatusUpdateTemplate($order['customer_name'], $order_id, $status);
            sendOrderEmail($order['customer_email'], "Actualizare Comandă #$order_id - Piața Locală", $emailContent);
        }
    } catch (Exception $emailError) {
        error_log("Status email error: " . $emailError->getMessage());
    }

    echo json_encode(['success' => true, 'message' => 'Status actualizat']);

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Eroare server']);
}
?>
