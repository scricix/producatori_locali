<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if (session_status() === PHP_SESSION_NONE) { session_start(); }
$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Metodă invalidă']);
    exit;
}

$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$password = $data['password'] ?? '';
$role = $data['role'] ?? 'customer';

// Validation
if (empty($name) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Toate câmpurile sunt obligatorii']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Email invalid']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Parola trebuie să aibă minim 6 caractere']);
    exit;
}

try {
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE user_email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email-ul este deja înregistrat']);
        exit;
    }

    // Split name into first and last
    $nameParts = explode(' ', $name, 2);
    $firstName = $nameParts[0];
    $lastName = $nameParts[1] ?? '';

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert user
    $stmt = $pdo->prepare("
        INSERT INTO users (first_name, last_name, user_email, phone, password, role, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $firstName,
        $lastName,
        $email,
        $phone,
        $hashedPassword,
        $role
    ]);

    // If producer, insert additional data if provided
    if ($role === 'producer' && isset($data['business_name'])) {
        $userId = $pdo->lastInsertId();
        $stmt = $pdo->prepare("
            UPDATE users 
            SET business_name = ?, description = ?, county = ?, city = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $data['business_name'] ?? '',
            $data['description'] ?? '',
            $data['county'] ?? '',
            $data['city'] ?? '',
            $userId
        ]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Cont creat cu succes',
        'user' => [
            'id' => $pdo->lastInsertId(),
            'name' => $name,
            'email' => $email,
            'role' => $role
        ]
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Eroare la crearea contului']);
}
?>
