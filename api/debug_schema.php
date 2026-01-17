<?php
require_once '../config/database.php';
try {
    $stmt = $pdo->query("DESCRIBE products");
    echo json_encode($stmt->fetchAll());
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
