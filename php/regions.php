<?php
header('Content-Type: application/json');
require_once 'config.php';

$action = $_GET['action'] ?? '';

switch($action) {
    case 'get':
        $result = mysqli_query($conn, "SELECT * FROM REGION ORDER BY Region_ID");
        $data = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
        echo json_encode($data);
        break;
        
    case 'add':
        $region_id = $_POST['Region_ID'];
        $region_name = $_POST['Region_Name'];
        $region_type = $_POST['Region_Type'];
        $area = $_POST['Area'];
        $description = $_POST['Description'] ?? '';
        
        $sql = "INSERT INTO REGION (Region_ID, Region_Name, Region_Type, Area, Description) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "issds", $region_id, $region_name, $region_type, $area, $description);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
        }
        break;
        
    case 'delete':
        $id = $_GET['id'];
        mysqli_begin_transaction($conn);
        try {
            mysqli_query($conn, "DELETE FROM LOCATION WHERE Region_ID = $id");
            mysqli_query($conn, "DELETE FROM GEOGRAPHICAL_FEATURE WHERE Region_ID = $id");
            mysqli_query($conn, "DELETE FROM REGION WHERE Region_ID = $id");
            mysqli_commit($conn);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            mysqli_rollback($conn);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
}
?>