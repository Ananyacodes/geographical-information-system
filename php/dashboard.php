<?php
header('Content-Type: application/json');
require_once 'config.php';

$stats = [];

// Total regions
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM REGION");
$stats['totalRegions'] = mysqli_fetch_assoc($result)['count'];

// Total locations
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM LOCATION");
$stats['totalLocations'] = mysqli_fetch_assoc($result)['count'];

// Total features
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM GEOGRAPHICAL_FEATURE");
$stats['totalFeatures'] = mysqli_fetch_assoc($result)['count'];

// Total infrastructure
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM INFRASTRUCTURE");
$stats['totalInfrastructure'] = mysqli_fetch_assoc($result)['count'];

// Recent regions
$result = mysqli_query($conn, "SELECT Region_ID, Region_Name, Region_Type, Area FROM REGION LIMIT 5");
$stats['recentRegions'] = [];
while ($row = mysqli_fetch_assoc($result)) {
    $stats['recentRegions'][] = $row;
}

echo json_encode($stats);
?>