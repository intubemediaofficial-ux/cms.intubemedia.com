<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

define('DATA_DIR', __DIR__ . '/../data/');

$file = DATA_DIR . 'content.json';
if (!file_exists($file)) {
    echo '{}';
    exit;
}

echo file_get_contents($file);
