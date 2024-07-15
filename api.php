<?php
// Configuración de la base de datos
$servername = "127.0.0.1:3306";
$username = "macarena";
$password = "pepito";
$dbnombre = "pepito";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbnombre);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Operaciones según el método de solicitud
$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
    case 'POST':
        // Insertar un nuevo registro
        $data = json_decode(file_get_contents("php://input"), true);
        $nombrephp = $data['nombrehtml'];
        $sql = "INSERT INTO tabla_de_macarena (columna1deprueba) VALUES ('$nombrephp')";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Nuevo registro creado con éxito"]);
        } else {
            echo json_encode(["message" => "Error: " . $sql . "<br>" . $conn->error]);
        }
        break;
    case 'GET':
        // Obtener todos los registros
        $sql = "SELECT * FROM tabla_de_macarena";
        $result = $conn->query($sql);

        $rows = [];
        while($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        echo json_encode($rows);
        break;
    case 'PUT':
        // Editar un registro
        $data = json_decode(file_get_contents("php://input"), true);
        $id = intval($data['id']);
        $nombrephp = $data['nombrehtml'];
        $sql = "UPDATE tabla_de_macarena SET columna1deprueba='$nombrephp' WHERE id=$id";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Registro actualizado con éxito"]);
        } else {
            echo json_encode(["message" => "Error: " . $sql . "<br>" . $conn->error]);
        }
        break;
    case 'DELETE':
        // Eliminar un registro
        $data = json_decode(file_get_contents("php://input"), true);
        $id = intval($data['id']);
        $sql = "DELETE FROM tabla_de_macarena WHERE id=$id";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Registro eliminado con éxito"]);
        } else {
            echo json_encode(["message" => "Error: " . $sql . "<br>" . $conn->error]);
        }
        break;
}
?>
