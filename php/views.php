<?php
header('Content-Type: application/json');
require_once 'config.php';

$view = $_GET['view'] ?? '';

$validViews = ['Region_Statistics_View', 'Infrastructure_Dashboard', 'Geographical_Feature_Details', 'Location_Analytics_View'];

if (!in_array($view, $validViews)) {
    echo json_encode([]);
    exit;
}

$result = mysqli_query($conn, "SELECT * FROM $view");
$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}
echo json_encode($data);
?>