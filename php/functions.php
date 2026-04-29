<?php
header('Content-Type: application/json');
require_once 'config.php';

$action = $_GET['action'] ?? '';

switch($action) {
    case 'avg_elevation':
        $region_id = $_GET['region_id'];
        $result = mysqli_query($conn, "SELECT Get_Region_Avg_Elevation($region_id) as result");
        $row = mysqli_fetch_assoc($result);
        echo json_encode(['value' => $row['result']]);
        break;
        
    case 'total_capacity':
        $region_id = $_GET['region_id'];
        $result = mysqli_query($conn, "SELECT Get_Region_Total_Capacity($region_id) as result");
        $row = mysqli_fetch_assoc($result);
        echo json_encode(['value' => $row['result']]);
        break;
}
?>