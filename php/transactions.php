<?php
header('Content-Type: application/json');
require_once 'config.php';

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

switch($action) {
    case 'transfer_population':
        $from = (int) ($input['from_feature'] ?? 0);
        $to = (int) ($input['to_feature'] ?? 0);
        $amount = (float) ($input['amount'] ?? 0);

        if ($from <= 0 || $to <= 0 || $amount <= 0) {
            echo json_encode(['success' => false, 'message' => 'Please provide valid region IDs and a positive transfer amount']);
            break;
        }
        
        mysqli_begin_transaction($conn);
        
        try {
            $stmt = mysqli_prepare($conn, "SELECT Area FROM REGION WHERE Region_ID = ?");
            mysqli_stmt_bind_param($stmt, 'i', $from);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_bind_result($stmt, $source_area);
            mysqli_stmt_fetch($stmt);
            mysqli_stmt_close($stmt);

            $stmt = mysqli_prepare($conn, "SELECT Area FROM REGION WHERE Region_ID = ?");
            mysqli_stmt_bind_param($stmt, 'i', $to);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_bind_result($stmt, $target_area);
            mysqli_stmt_fetch($stmt);
            mysqli_stmt_close($stmt);

            if (!isset($source_area) || !isset($target_area)) {
                throw new Exception('Both regions must exist');
            }

            if ((float) $source_area < $amount) {
                throw new Exception('Insufficient area in source region');
            }
            
            $stmt = mysqli_prepare($conn, "UPDATE REGION SET Area = Area - ? WHERE Region_ID = ?");
            mysqli_stmt_bind_param($stmt, 'di', $amount, $from);
            mysqli_stmt_execute($stmt);

            $stmt = mysqli_prepare($conn, "UPDATE REGION SET Area = Area + ? WHERE Region_ID = ?");
            mysqli_stmt_bind_param($stmt, 'di', $amount, $to);
            mysqli_stmt_execute($stmt);
            
            mysqli_commit($conn);
            echo json_encode(['success' => true, 'message' => "Transferred $amount area from Region $from to Region $to"]);
        } catch (Exception $e) {
            mysqli_rollback($conn);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
        
    case 'add_location_infra':
        mysqli_begin_transaction($conn);
        
        try {
            $result = mysqli_query($conn, "SELECT MIN(Region_ID) as region_id FROM REGION");
            $regionRow = mysqli_fetch_assoc($result);
            $region_id = (int) ($regionRow['region_id'] ?? 0);

            if ($region_id <= 0) {
                throw new Exception('No region available to attach the new location');
            }

            $result = mysqli_query($conn, "SELECT COALESCE(MAX(Location_ID), 0) as max_id FROM LOCATION");
            $next_loc_id = ((int) mysqli_fetch_assoc($result)['max_id']) + 1;
            
            $result = mysqli_query($conn, "SELECT COALESCE(MAX(Infrastructure_ID), 0) as max_id FROM INFRASTRUCTURE");
            $next_infra_id = ((int) mysqli_fetch_assoc($result)['max_id']) + 1;
            
            $latitude = 40.7128;
            $longitude = -74.0060;
            $elevation = 10.5;
            $stmt = mysqli_prepare($conn, "INSERT INTO LOCATION (Location_ID, Latitude, Longitude, Elevation, Region_ID) VALUES (?, ?, ?, ?, ?)");
            mysqli_stmt_bind_param($stmt, 'idddi', $next_loc_id, $latitude, $longitude, $elevation, $region_id);
            mysqli_stmt_execute($stmt);

            $infrastructure_name = 'New Infrastructure';
            $infrastructure_type = 'Utility';
            $capacity = 5000;
            $stmt = mysqli_prepare($conn, "INSERT INTO INFRASTRUCTURE (Infrastructure_ID, Infrastructure_Name, Infrastructure_Type, Capacity, Location_ID) VALUES (?, ?, ?, ?, ?)");
            mysqli_stmt_bind_param($stmt, 'issii', $next_infra_id, $infrastructure_name, $infrastructure_type, $capacity, $next_loc_id);
            mysqli_stmt_execute($stmt);
            
            mysqli_commit($conn);
            echo json_encode(['success' => true, 'message' => "Added Location ID: $next_loc_id with Infrastructure ID: $next_infra_id"]);
        } catch (Exception $e) {
            mysqli_rollback($conn);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
        
    case 'test_check_constraint':
        $result = mysqli_query($conn, "INSERT INTO REGION (Region_ID, Region_Name, Region_Type, Area, Description) VALUES (999, 'Test', 'Test', -100, 'Should fail')");
        if ($result) {
            echo json_encode(['message' => "⚠️ Insert succeeded - CHECK constraint may not be active"]);
            mysqli_query($conn, "DELETE FROM REGION WHERE Region_ID = 999");
        } else {
            echo json_encode(['message' => "✅ CHECK constraint working: " . mysqli_error($conn)]);
        }
        break;
}
?>