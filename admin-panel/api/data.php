<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$section = $_GET['section'] ?? null;
$id = $_GET['id'] ?? null;

if ($method === 'GET') {
    $data = getData();
    if ($section && isset($data[$section])) {
        jsonResponse($data[$section]);
    } elseif ($section) {
        jsonResponse(['error' => 'Section not found'], 404);
    } else {
        jsonResponse($data);
    }
}

requireAuth();

if ($method === 'PUT' || $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $data = getData();

    if (!$section) {
        jsonResponse(['error' => 'Section parameter required'], 400);
    }

    if ($section === 'settings' || $section === 'stats') {
        $data[$section] = $input;
        saveData($data);
        jsonResponse(['success' => true, 'message' => ucfirst($section) . ' updated']);
    }

    if (!isset($data[$section])) {
        $data[$section] = [];
    }

    if ($method === 'POST') {
        $maxId = 0;
        foreach ($data[$section] as $item) {
            if (isset($item['id']) && $item['id'] > $maxId) {
                $maxId = $item['id'];
            }
        }
        $input['id'] = $maxId + 1;
        $data[$section][] = $input;
        saveData($data);
        jsonResponse(['success' => true, 'message' => 'Item added', 'id' => $input['id']], 201);
    }

    if ($method === 'PUT' && $id) {
        foreach ($data[$section] as &$item) {
            if (isset($item['id']) && $item['id'] == $id) {
                $input['id'] = (int)$id;
                $item = $input;
                saveData($data);
                jsonResponse(['success' => true, 'message' => 'Item updated']);
            }
        }
        jsonResponse(['error' => 'Item not found'], 404);
    }

    if ($method === 'PUT' && !$id) {
        $data[$section] = $input;
        saveData($data);
        jsonResponse(['success' => true, 'message' => ucfirst($section) . ' updated']);
    }
}

if ($method === 'DELETE') {
    requireAuth();
    if (!$section || !$id) {
        jsonResponse(['error' => 'Section and ID required'], 400);
    }
    $data = getData();
    if (!isset($data[$section])) {
        jsonResponse(['error' => 'Section not found'], 404);
    }
    $data[$section] = array_values(array_filter($data[$section], function($item) use ($id) {
        return !isset($item['id']) || $item['id'] != $id;
    }));
    saveData($data);
    jsonResponse(['success' => true, 'message' => 'Item deleted']);
}

jsonResponse(['error' => 'Method not allowed'], 405);
