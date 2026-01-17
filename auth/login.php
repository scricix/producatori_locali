<?php
session_start();
header('Content-Type: application/json');
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Metodă invalidă']);
    exit;
}

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$remember = $data['remember'] ?? false;

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email și parolă sunt obligatorii']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE user_email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Email sau parolă incorectă']);
        exit;
    }

    // Verify password (assuming password is hashed)
    if (!password_verify($password, $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'Email sau parolă incorectă']);
        exit;
    }

    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['user_email'];
    $_SESSION['user_role'] = $user['role'] ?? 'customer';

    // Return user data (without password)
    unset($user['password']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Autentificare reușită',
        'user' => [
            'id' => $user['id'],
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'email' => $user['user_email'],
            'role' => $user['role'] ?? 'customer'
        ]
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Eroare server']);
}
?>
