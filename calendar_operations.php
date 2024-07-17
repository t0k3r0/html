<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Permitir CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Configuración de la base de datos
$servername = "127.0.0.1:3306";
$username = "macarena";
$password = "pepito";
$dbnombre = "agenda";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbnombre);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Configuración para recibir solicitudes JSON
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

$action = $data['action'];

switch ($action) {
    case 'fetch_notes':
        fetchNotes($data['date']);
        break;
    case 'save_note':
        saveNote($data['date'], $data['note']);
        break;
    case 'delete_note':
        deleteNote($data['date'], $data['noteId']);
        break;
    case 'fetch_tasks':
        fetchTasks();
        break;
    case 'save_task':
        saveTask($data['task']);
        break;
    case 'delete_task':
        deleteTask($data['taskId']);
        break;
    case 'mark_task_completed':
        markTaskAsCompleted($data['taskId']);
        break;
    case 'reorder_tasks':
        reorderTask($data['oldIndex'], $data['newIndex']);
        break;
    case 'update_more_info':
        updateMoreInfo($data['id'], $data['moreInfo']);
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
}

$conn->close();

function fetchNotes($date)
{
    global $conn;
    $stmt = $conn->prepare("SELECT * FROM eventos_diarios WHERE fecha = ?");
    $stmt->bind_param("s", $date);
    $stmt->execute();
    $result = $stmt->get_result();
    $notes = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($notes);
}

function saveNote($date, $note)
{
    global $conn;
    $stmt = $conn->prepare("INSERT INTO eventos_diarios (fecha, hora, texto, mas_info) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $date, $note['hour'], $note['text'], $note['moreInfo']);
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Nota guardada con éxito']);
    } else {
        echo json_encode(['error' => 'Error al guardar la nota']);
    }
}

function deleteNote($date, $noteId)
{
    global $conn;
    $stmt = $conn->prepare("DELETE FROM eventos_diarios WHERE id = ?");
    $stmt->bind_param("i", $noteId);
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Nota eliminada con éxito']);
    } else {
        echo json_encode(['error' => 'Error al eliminar la nota']);
    }
}

function fetchTasks()
{
    global $conn;
    $stmt = $conn->prepare("SELECT * FROM tareas_pendientes");
    $stmt->execute();
    $result = $stmt->get_result();
    $tasks = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($tasks);
}

function saveTask($task)
{
    global $conn;

    // Iniciar una transacción
    $conn->begin_transaction();

    try {
        // Obtener el valor más alto de la columna `posicion`
        $result = $conn->query("SELECT MAX(posicion) as max_pos FROM tareas_pendientes");
        $row = $result->fetch_assoc();
        $nuevaPosicion = $row['max_pos'] + 1;

        // Preparar y ejecutar la consulta INSERT con la nueva posición
        $stmt = $conn->prepare("INSERT INTO tareas_pendientes (texto, mas_info, completada, posicion) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssii", $task['text'], $task['moreInfo'], $task['completed'], $nuevaPosicion);

        if ($stmt->execute()) {
            // Confirmar la transacción
            $conn->commit();
            echo json_encode(['success' => 'Tarea guardada con éxito']);
        } else {
            // Revertir la transacción en caso de error
            $conn->rollback();
            echo json_encode(['error' => 'Error al guardar la tarea']);
        }
    } catch (Exception $e) {
        // Revertir la transacción en caso de excepción
        $conn->rollback();
        echo json_encode(['error' => 'Error al procesar la solicitud']);
    }
}
function markTaskAsCompleted($taskId)
{
    global $conn;

    // Iniciar una transacción
    $conn->begin_transaction();

    try {
        // Obtener el estado actual de la tarea
        $stmt = $conn->prepare("SELECT completada FROM tareas_pendientes WHERE id = ?");
        $stmt->bind_param("i", $taskId);
        $stmt->execute();
        $result = $stmt->get_result();
        $task = $result->fetch_assoc();

        if ($task) {
            $completada = $task['completada'];

            if ($completada == 2) {
                // Si está completada, marcarla como no completada y eliminar la fecha de completado
                $stmt = $conn->prepare("UPDATE tareas_pendientes SET completada = 0, fecha_completado = NULL WHERE id = ?");
                $stmt->bind_param("i", $taskId);
            } else if ($completada == 1) {
                // Si no está completada, marcarla como completada y agregar la fecha de completado
                $fecha_completado = date('Y-m-d H:i:s');
                $stmt = $conn->prepare("UPDATE tareas_pendientes SET completada = 2, fecha_completado = ? WHERE id = ?");
                $stmt->bind_param("si", $fecha_completado, $taskId);
            } else {
                $stmt = $conn->prepare("UPDATE tareas_pendientes SET completada = 1 WHERE id = ?");
                $stmt->bind_param("i", $taskId);
            }

            if ($stmt->execute()) {
                // Confirmar la transacción
                $conn->commit();
                echo json_encode(['success' => 'El estado de la tarea se ha actualizado correctamente']);
            } else {
                // Revertir la transacción en caso de error
                $conn->rollback();
                echo json_encode(['error' => 'Error al actualizar el estado de la tarea']);
            }
        } else {
            // Revertir la transacción si no se encuentra la tarea
            $conn->rollback();
            echo json_encode(['error' => 'Tarea no encontrada']);
        }
    } catch (Exception $e) {
        // Revertir la transacción en caso de excepción
        $conn->rollback();
        echo json_encode(['error' => 'Error al procesar la solicitud: ' . $e->getMessage()]);
    }
}





function deleteTask($taskId)
{
    global $conn;

    // Iniciar una transacción
    $conn->begin_transaction();

    try {

        $result = $conn->query("SELECT * FROM tareas_pendientes WHERE id = $taskId");
        $task = $result->fetch_assoc();

        if (!$task) {
            throw new Exception("Tarea no encontrada");
        }

        // Insertar los datos de la tarea en tareas_pendientes_eliminadas
        $stmt = $conn->prepare("INSERT INTO tareas_pendientes_eliminadas (id, texto, mas_info, completada, posicion, fecha_completado) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssis", $task['id'], $task['texto'], $task['mas_info'], $task['completada'], $task['posicion'], $task['fecha_completado']);
        $stmt->execute();
        // Obtener la posición de la tarea que va a ser eliminada y guardarla en la variable @posicion
        $conn->query("SET @posicion := (SELECT posicion FROM tareas_pendientes WHERE id = $taskId)");

        // Eliminar la tarea
        $stmt = $conn->prepare("DELETE FROM tareas_pendientes WHERE id = ?");
        $stmt->bind_param("i", $taskId);
        $stmt->execute();

        // Decrementar en 1 la columna posicion de todas las filas con una posición mayor a @posicion
        $conn->query("UPDATE tareas_pendientes SET posicion = posicion - 1 WHERE posicion > @posicion");

        // Confirmar la transacción
        $conn->commit();
        echo json_encode(['success' => 'Tarea eliminada con éxito y posiciones actualizadas']);
    } catch (Exception $e) {
        // Revertir la transacción en caso de excepción
        $conn->rollback();
        echo json_encode(['error' => 'Error al procesar la solicitud']);
    }
}
function updateMoreInfo($id, $moreInfo)
{
    global $conn;
    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("UPDATE tareas_pendientes SET mas_info = ? WHERE id = ?");
        $stmt->bind_param("si", $moreInfo, $id);
        $stmt->execute();
        $conn->commit();
        echo json_encode(['success' => 'Más información actualizado con éxito']);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['error' => 'Error al actualizar maás información: ' . $e->getMessage()]);
    }
}

function reorderTask($posAntigua, $posNueva)
{
    global $conn;

    // Iniciar una transacción
    $conn->begin_transaction();

    try {
        // Guardar la posición de la tarea en una variable temporal en SQL
        // $conn->query("SET @tempPosition := -1;");

        // Guardar la posición antigua en una variable temporal
        $stmt = $conn->prepare("UPDATE tareas_pendientes SET posicion = -1 WHERE posicion = ?");
        $stmt->bind_param("i", $posAntigua);
        $stmt->execute();

        if ($posAntigua < $posNueva) {
            // Mover hacia adelante, decrementando posiciones intermedias
            $stmt = $conn->prepare("UPDATE tareas_pendientes SET posicion = posicion - 1 WHERE posicion > ? AND posicion <= ?");
            $stmt->bind_param("ii", $posAntigua, $posNueva);
            $stmt->execute();
        } else {
            // Mover hacia atrás, incrementando posiciones intermedias
            $stmt = $conn->prepare("UPDATE tareas_pendientes SET posicion = posicion + 1 WHERE posicion >= ? AND posicion < ?");
            $stmt->bind_param("ii", $posNueva, $posAntigua);
            $stmt->execute();
        }

        // Colocar la tarea en su nueva posición
        $stmt = $conn->prepare("UPDATE tareas_pendientes SET posicion = ? WHERE posicion = -1");
        $stmt->bind_param("i", $posNueva);
        $stmt->execute();
        // echo "hola";

        // Confirmar la transacción
        $conn->commit();

        echo json_encode(['success' => 'Tarea reordenada con éxito']);
    } catch (Exception $e) {
        // Revertir la transacción en caso de error
        $conn->rollback();
        echo json_encode(['error' => 'Error al reordenar la tarea: ' . $e->getMessage()]);
    }
}

?>