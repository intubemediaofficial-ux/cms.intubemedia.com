<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=60');

$dataFile = __DIR__ . '/../data/content.json';
if (file_exists($dataFile)) {
    echo file_get_contents($dataFile);
} else {
    echo '{}';
}
