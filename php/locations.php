<?php
header('Content-Type: application/json');
require_once 'config.php';

$action = $_GET['action'] ?? '';

switch($action) {
    case 'get':
        $result = mysqli_query($conn, "SELECT * FROM LOCATION ORDER BY Location_ID");
        $data = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
        echo json_encode($data);
        break;
        
    case 'add':
        $location_id = $_POST['Location_ID'];
        $latitude = $_POST['Latitude'];
        $longitude = $_POST['Longitude'];
        $elevation = $_POST['Elevation'];
        $region_id = $_POST['Region_ID'];
        
        $sql = "INSERT INTO LOCATION (Location_ID, Latitude, Longitude, Elevation, Region_ID) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "idddi", $location_id, $latitude, $longitude, $elevation, $region_id);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
        }
        break;
        
    case 'delete':
        $id = $_GET['id'];
        mysqli_query($conn, "DELETE FROM INFRASTRUCTURE WHERE Location_ID = $id");
        mysqli_query($conn, "DELETE FROM LOCATION WHERE Location_ID = $id");
        echo json_encode(['success' => true]);
        break;
}
?>