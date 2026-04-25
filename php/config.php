<?php
$host = getenv('DB_HOST') ?: 'db';
$username = getenv('DB_USER') ?: 'gis_user';
$password = getenv('DB_PASSWORD') ?: 'gis_password';
$database = getenv('DB_NAME') ?: 'gis_database';
$port = (int) (getenv('DB_PORT') ?: 3306);

$conn = mysqli_connect($host, $username, $password, $database, $port);

if (!$conn) {
    die(json_encode(['error' => 'Connection failed: ' . mysqli_connect_error()]));
}

mysqli_set_charset($conn, 'utf8mb4');

function executeQuery($conn, $sql, $params = [], $types = "") {
    $stmt = mysqli_prepare($conn, $sql);
    if ($stmt && !empty($params)) {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }
    mysqli_stmt_execute($stmt);
    return mysqli_stmt_get_result($stmt);
}
?>