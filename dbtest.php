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

// Operaciones de prueba (ejemplo: insertar un registro)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombrephp = $_POST['nombrehtml'];
    $sql = "INSERT INTO tabla_de_macarena (columna1deprueba) VALUES ('$nombrephp')";

    if ($conn->query($sql) === TRUE) {
        echo "Nuevo registro creado con éxito";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Prueba de Base de Datos</title>
</head>
<body>
    <h1>Prueba de Base de Datos</h1>
    <form method="post">
        Nombre: <input type="text" name="nombrehtml" required>
        <input type="submit" value="Enviar">
    </form>
</body>
</html>
