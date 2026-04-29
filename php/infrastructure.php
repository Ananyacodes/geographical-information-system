<?php
header('Content-Type: application/json');
require_once 'config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
	case 'get':
		$result = mysqli_query($conn, "SELECT Infrastructure_ID, Infrastructure_Name, Infrastructure_Type, Capacity, Location_ID FROM INFRASTRUCTURE ORDER BY Infrastructure_ID");
		$data = [];
		while ($row = mysqli_fetch_assoc($result)) {
			$data[] = $row;
		}
		echo json_encode($data);
		break;

	case 'add':
		$infrastructure_id = (int) ($_POST['Infrastructure_ID'] ?? 0);
		$infrastructure_name = $_POST['Infrastructure_Name'] ?? '';
		$infrastructure_type = $_POST['Infrastructure_Type'] ?? '';
		$capacity = (int) ($_POST['Capacity'] ?? 0);
		$location_id = (int) ($_POST['Location_ID'] ?? 0);

		$stmt = mysqli_prepare(
			$conn,
			"INSERT INTO INFRASTRUCTURE (Infrastructure_ID, Infrastructure_Name, Infrastructure_Type, Capacity, Location_ID) VALUES (?, ?, ?, ?, ?)"
		);
		mysqli_stmt_bind_param($stmt, 'issii', $infrastructure_id, $infrastructure_name, $infrastructure_type, $capacity, $location_id);

		if (mysqli_stmt_execute($stmt)) {
			echo json_encode(['success' => true]);
		} else {
			echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
		}
		break;

	case 'delete':
		$infrastructure_id = (int) ($_GET['id'] ?? 0);
		$stmt = mysqli_prepare($conn, "DELETE FROM INFRASTRUCTURE WHERE Infrastructure_ID = ?");
		mysqli_stmt_bind_param($stmt, 'i', $infrastructure_id);

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
