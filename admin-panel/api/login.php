<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['login_time'] = time();
        jsonResponse(['success' => true, 'message' => 'Login successful']);
    } else {
        jsonResponse(['success' => false, 'message' => 'Invalid credentials'], 401);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    jsonResponse(['logged_in' => isLoggedIn()]);
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
