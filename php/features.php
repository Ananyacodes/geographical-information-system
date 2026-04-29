<?php
header('Content-Type: application/json');
require_once 'config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
	case 'get':
		$result = mysqli_query($conn, "SELECT Feature_ID, Feature_Name, Feature_Type, Region_ID FROM GEOGRAPHICAL_FEATURE ORDER BY Feature_ID");
		$data = [];
		while ($row = mysqli_fetch_assoc($result)) {
			$data[] = $row;
		}
		echo json_encode($data);
		break;

	case 'add':
		$feature_id = (int) ($_POST['Feature_ID'] ?? 0);
		$feature_name = $_POST['Feature_Name'] ?? '';
		$feature_type = $_POST['Feature_Type'] ?? '';
		$region_id = (int) ($_POST['Region_ID'] ?? 0);

		$stmt = mysqli_prepare(
			$conn,
			"INSERT INTO GEOGRAPHICAL_FEATURE (Feature_ID, Feature_Name, Feature_Type, Region_ID) VALUES (?, ?, ?, ?)"
		);
		mysqli_stmt_bind_param($stmt, 'issi', $feature_id, $feature_name, $feature_type, $region_id);

		if (mysqli_stmt_execute($stmt)) {
			echo json_encode(['success' => true]);
		} else {
			echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
		}
		break;

	case 'delete':
		$feature_id = (int) ($_GET['id'] ?? 0);
		$stmt = mysqli_prepare($conn, "DELETE FROM GEOGRAPHICAL_FEATURE WHERE Feature_ID = ?");
		mysqli_stmt_bind_param($stmt, 'i', $feature_id);

		if (mysqli_stmt_execute($stmt)) {
			echo json_encode(['success' => mysqli_stmt_affected_rows($stmt) > 0]);
		} else {
			echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
		}
		break;

	default:
		echo json_encode(['success' => false, 'message' => 'Invalid action']);
		break;
}
?>
