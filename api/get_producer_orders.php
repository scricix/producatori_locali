<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$producer_email = $_GET['email'] ?? '';

if (empty($producer_email)) {
    echo json_encode(['success' => false, 'message' => 'Email producător lipsă']);
    exit;
}

try {
    // We want orders that have at least one item from this producer
    // AND we want to fetch those specific items
    $query = "SELECT DISTINCT o.* 
              FROM orders o
              JOIN order_items oi ON o.id = oi.order_id
              WHERE oi.producer_email = ?
              ORDER BY o.created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$producer_email]);
    $orders = $stmt->fetchAll();

    // For each order, fetch the items belonging to this producer
    foreach ($orders as &$order) {
        $stmtItems = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ? AND producer_email = ?");
        $stmtItems->execute([$order['id'], $producer_email]);
        $order['items'] = $stmtItems->fetchAll();
    }

    echo json_encode([
        'success' => true,
        'data' => $orders
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Eroare server']);
}
?>
