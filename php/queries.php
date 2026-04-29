<?php
header('Content-Type: application/json');
require_once 'config.php';

$type = $_GET['type'] ?? '';

switch($type) {
    case 'region_stats':
        $sql = "SELECT 
                    r.Region_Name, r.Region_Type,
                    COUNT(DISTINCT l.Location_ID) AS Total_Locations,
                    ROUND(AVG(l.Elevation), 2) AS Average_Elevation,
                    COUNT(DISTINCT i.Infrastructure_ID) AS Total_Infrastructure
                FROM REGION r
                LEFT JOIN LOCATION l ON r.Region_ID = l.Region_ID
                LEFT JOIN INFRASTRUCTURE i ON l.Location_ID = i.Location_ID
                GROUP BY r.Region_ID";
        break;
        
    case 'infrastructure_coverage':
        $sql = "SELECT 
                    i.Infrastructure_Name, i.Infrastructure_Type, i.Capacity,
                    l.Latitude, l.Longitude, r.Region_Name
                FROM INFRASTRUCTURE i
                JOIN LOCATION l ON i.Location_ID = l.Location_ID
                JOIN REGION r ON l.Region_ID = r.Region_ID";
        break;
        
    case 'elevation_analysis':
        $sql = "SELECT 
                    r.Region_Name,
                    MIN(l.Elevation) AS Min_Elevation,
                    MAX(l.Elevation) AS Max_Elevation,
                    ROUND(AVG(l.Elevation), 2) AS Avg_Elevation,
                    COUNT(l.Location_ID) AS Location_Count
                FROM REGION r
                LEFT JOIN LOCATION l ON r.Region_ID = l.Region_ID
                GROUP BY r.Region_ID
                ORDER BY Avg_Elevation DESC";
        break;
        
    case 'unpopulated_regions':
        $sql = "SELECT Region_Name FROM REGION 
                WHERE Region_ID NOT IN (SELECT DISTINCT Region_ID FROM LOCATION WHERE Region_ID IS NOT NULL)";
        break;
        
    case 'unserviced_features':
        $sql = "SELECT gf.Feature_Name
            FROM GEOGRAPHICAL_FEATURE gf
            WHERE NOT EXISTS (
                SELECT 1
                FROM INFRASTRUCTURE i
                JOIN LOCATION l ON i.Location_ID = l.Location_ID
                WHERE l.Region_ID = gf.Region_ID
            )";
        break;
        
    case 'combined_features':
        $sql = "SELECT Feature_Name AS Geo_Entity, 'Geographical' AS Entity_Type FROM GEOGRAPHICAL_FEATURE
                UNION
                SELECT Infrastructure_Name AS Geo_Entity, 'Infrastructure' AS Entity_Type FROM INFRASTRUCTURE";
        break;
        
    case 'avg_elevation_function':
        // Call your stored function
        $region_id = $_GET['region_id'] ?? 1;
        $result = mysqli_query($conn, "SELECT Get_Region_Avg_Elevation($region_id) as avg_elev");
        $row = mysqli_fetch_assoc($result);
        echo json_encode([['Function_Result' => $row['avg_elev']]]);
        exit;
        
    case 'total_capacity_function':
        $region_id = $_GET['region_id'] ?? 1;
        $result = mysqli_query($conn, "SELECT Get_Region_Total_Capacity($region_id) as total_cap");
        $row = mysqli_fetch_assoc($result);
        echo json_encode([['Function_Result' => $row['total_cap']]]);
        exit;
        
    default:
        $result = mysqli_query($conn, "SELECT * FROM REGION LIMIT 10");
        $data = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
        echo json_encode($data);
        exit;
}

$result = mysqli_query($conn, $sql);
$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}
echo json_encode($data);
?>