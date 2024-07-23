import { showNotification } from "./calendar.js";
export async function fetchNotesForDate(date) {
  try {
    const response = await fetch(
      "http://192.168.1.14/calendar_operations.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "fetch_notes", date }),
      }
    );
    if (!response.ok) {
      throw new Error("Error al obtener notas para la fecha.");
    }
    const notes = await response.json();
    return Array.isArray(notes) ? notes : [];
  } catch (error) {
    console.error("Error en fetchNotesForDate:", error);
    return [];
  }
}
export async function saveNotesForDate(date, notes) {
  try {
    for (const note of notes) {
      const response = await fetch(
        "http://192.168.1.14/calendar_operations.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "save_note", date, note }),
        }
      );
      if (!response.ok) {
        throw new Error("Error al guardar notas para la fecha.");
      }
    }
  } catch (error) {
    console.error("Error en saveNotesForDate:", error);
  }
}
export async function completeNoteForDate(noteId) {
  try {
    const response = await fetch(
      "http://192.168.1.14/calendar_operations.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "complete_note", noteId }),
      }
    );
    if (!response.ok) {
      throw new Error("Error al completar la nota.");
    }
  } catch (error) {
    console.error("Error en completeNoteForDate:", error);
  }
}
export async function fetchTasks() {
  try {
    const response = await fetch(
      "http://192.168.1.14/calendar_operations.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "fetch_tasks" }),
      }
    );
    if (!response.ok) {
      throw new Error("Error al obtener las tareas.");
    }
    const tasks = await response.json();
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.error("Error en fetchTasks:", error);
    return [];
  }
}
export async function saveTask(task) {
  try {
    const response = await fetch(
      "http://192.168.1.14/calendar_operations.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "save_task", task }),
      }
    );
    if (!response.ok) {
      throw new Error("Error al guardar la tarea.");
    }
    const data = await response.json();
    if (data.status !== "success") {
      throw new Error(data.error || "Error desconocido");
    }
  } catch (error) {
    console.error("Error en saveTask:", error);
  }
}
export async function updateMoreInfo(taskId, newMoreInfo) {
  try {
    const response = await fetch(
      "http://192.168.1.14/calendar_operations.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_more_info",
          id: taskId,
          moreInfo: newMoreInfo,
        }),
      }
    );
    if (!response.ok) {
      showNotification("Error al guardar la descripción de la tarea", "red");
    } else {
      showNotification("Descripción de la tarea guardada con éxito", "green");
    }
    // const data = await response.json();
    // return data;
  } catch (error) {
    console.error("Error updating more info in DB:", error);
  }
}
export async function deleteTask(taskId) {
  try {
    const response = await fetch(
      "http://192.168.1.14/calendar_operations.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete_task", taskId }),
      }
    );
    if (!response.ok) {
      throw new Error("Error al eliminar la tarea.");
    }
  } catch (error) {
    console.error("Error en deleteTask:", error);
  }
}
export async function markTaskAsCompleted(taskId) {
  try {
    const response = await fetch(
      "http://192.168.1.14/calendar_operations.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "mark_task_completed",
          taskId: taskId,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) {
      console.error("Error en la respuesta del servidor:", data.error);
    }
  } catch (error) {
    console.error("Error al marcar la tarea como completada:", error);
  }
}
export async function updateTaskOrder(newOrder, oldIndex, newIndex) {
  try {
    oldIndex++;
    newIndex++;
    const response = await fetch(
      "http://192.168.1.14/calendar_operations.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reorder_tasks",
          newOrder,
          oldIndex,
          newIndex,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Error al actualizar el orden de las tareas.");
    }
  } catch (error) {
    console.error("Error en updateTaskOrder:", error);
  }
}
