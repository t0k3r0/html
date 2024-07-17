document.addEventListener("DOMContentLoaded", function () {
    const weekdays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
    const daysContainer = document.getElementById("days-container");
    const monthYearElement = document.getElementById("month-year");
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    const popupOverlay = document.getElementById("popup-overlay");
    const closePopupButton = document.getElementById("close-popup");
    const saveTimeButton = document.getElementById("save-time");
    const pendingTasksContainer = document.getElementById("pendientes");
    const taskInputOverlay = document.getElementById("task-input-overlay");
    const taskTextInput = document.getElementById("task-text");
    const addTaskButton = document.getElementById("add-task");
    const saveTaskButton = document.getElementById("save-task");
    const cancelTaskButton = document.getElementById("cancel-task");
    const sortableList = document.getElementById("sortable");
    const proximasContainer = document.getElementById("proximas");
    let selectedDate = "";
    let tasks = {};
    let tareasPendientes = [];
  
    function getMonthName(monthIndex) {
      const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return months[monthIndex];
    }
  
    async function fetchNotesForDate(date) {
      try {
        const response = await fetch("http://192.168.1.14/calendar_operations.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "fetch_notes", date }),
        });
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
  
    async function saveNotesForDate(date, notes) {
      try {
        for (const note of notes) {
          const response = await fetch("http://192.168.1.14/calendar_operations.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "save_note", date, note }),
          });
          if (!response.ok) {
            throw new Error("Error al guardar notas para la fecha.");
          }
        }
      } catch (error) {
        console.error("Error en saveNotesForDate:", error);
      }
    }
  
    async function deleteNoteForDate(date, noteId) {
      try {
        const response = await fetch("http://192.168.1.14/calendar_operations.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "delete_note", date, noteId }),
        });
        if (!response.ok) {
          throw new Error("Error al eliminar la nota.");
        }
      } catch (error) {
        console.error("Error en deleteNoteForDate:", error);
      }
    }
  
    async function fetchTasks() {
      try {
        const response = await fetch("http://192.168.1.14/calendar_operations.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "fetch_tasks" }),
        });
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
  
    async function saveTask(task) {
      try {
        const response = await fetch("http://192.168.1.14/calendar_operations.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "save_task", task }),
        });
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
  
    async function updateMoreInfo(taskId, newMoreInfo) {
      try {
        const response = await fetch("http://192.168.1.14/calendar_operations.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "update_more_info",
            id: taskId,
            moreInfo: newMoreInfo,
          }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok(update more info)");
        }
      } catch (error) {
        console.error("Error updating more info in DB:", error);
      }
    }
  
    async function deleteTask(taskId) {
      try {
        const response = await fetch("http://192.168.1.14/calendar_operations.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "delete_task", taskId }),
        });
        if (!response.ok) {
          throw new Error("Error al eliminar la tarea.");
        }
      } catch (error) {
        console.error("Error en deleteTask:", error);
      }
    }
  
    async function markTaskAsCompleted(taskId) {
      try {
        const response = await fetch("http://192.168.1.14/calendar_operations.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "mark_task_completed",
            taskId: taskId,
          }),
        });
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.success) {
          console.log("Tarea marcada como completada con éxito");
        } else {
          console.error("Error en la respuesta del servidor:", data.error);
        }
      } catch (error) {
        console.error("Error al marcar la tarea como completada:", error);
      }
    }
  
    async function updateTaskOrder(newOrder, oldIndex, newIndex) {
      try {
        oldIndex++;
        newIndex++;
        const response = await fetch("http://192.168.1.14/calendar_operations.php", {
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
        });
        if (!response.ok) {
          throw new Error("Error al actualizar el orden de las tareas.");
        }
      } catch (error) {
        console.error("Error en updateTaskOrder:", error);
      }
    }
  
    async function generateMonthDays(month, year) {
      daysContainer.innerHTML = "";
      const firstDay = new Date(year, month, 1);
      const startingDay = firstDay.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let dayOfMonth = 1;
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 && j < startingDay) {
            const emptyDay = document.createElement("div");
            emptyDay.classList.add("empty");
            daysContainer.appendChild(emptyDay);
          } else if (dayOfMonth > daysInMonth) {
            const emptyDay = document.createElement("div");
            emptyDay.classList.add("empty");
            daysContainer.appendChild(emptyDay);
          } else {
            const dayElement = document.createElement("div");
            dayElement.classList.add("day");
  
            const dayNumber = document.createElement("span");
            dayNumber.textContent = dayOfMonth;
            dayElement.appendChild(dayNumber);
  
            const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")}`;
            const notes = await fetchNotesForDate(date);
            const notesCount = notes.length;
            if (notesCount > 0) {
              const notesButton = document.createElement("button");
              notesButton.classList.add("notes-button");
              notesButton.textContent = notesCount;
              dayElement.appendChild(notesButton);
            }
            dayElement.addEventListener("click", async function (e) {
              e.stopPropagation();
              const notes = await fetchNotesForDate(date);
              displayPopup(dayOfMonth, notes, date);
            });
            daysContainer.appendChild(dayElement);
            dayOfMonth++;
          }
        }
      }
      monthYearElement.textContent = `${getMonthName(month)} ${year}`;
    }
  
    function displayPopup(dayOfMonth, notes, date) {
      const popup = document.getElementById("popup");
      const notesList = document.getElementById("notes-list");
      notesList.innerHTML = "";
      notes.forEach((note) => {
        const listItem = document.createElement("li");
        listItem.textContent = note;
        notesList.appendChild(listItem);
      });
      const saveButton = document.getElementById("save-time");
      saveButton.addEventListener("click", function () {
        saveNotes(date);
      });
      popup.style.display = "block";
    }
  
    function closePopup() {
      const popup = document.getElementById("popup");
      popup.style.display = "none";
    }
  
    function addTaskToUI(task) {
      const listItem = document.createElement("li");
      listItem.classList.add("pending");
      listItem.textContent = task.description;
      const moreInfoInput = document.createElement("input");
      moreInfoInput.type = "text";
      moreInfoInput.classList.add("more-info");
      moreInfoInput.value = task.moreInfo || "";
      moreInfoInput.addEventListener("blur", () => {
        const newMoreInfo = moreInfoInput.value;
        task.moreInfo = newMoreInfo;
        updateMoreInfo(task.id, newMoreInfo);
      });
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-task");
      deleteButton.innerHTML = "&times;";
      deleteButton.addEventListener("click", async () => {
        await deleteTask(task.id);
        listItem.remove();
        tareasPendientes = tareasPendientes.filter((t) => t.id !== task.id);
        updatePendingTasks();
      });
      const completeButton = document.createElement("button");
      completeButton.classList.add("complete-task");
      completeButton.innerHTML = "&#10003;";
      completeButton.addEventListener("click", async () => {
        await markTaskAsCompleted(task.id);
        listItem.classList.remove("pending");
        listItem.classList.add("completed");
        completeButton.remove();
        tareasPendientes = tareasPendientes.filter((t) => t.id !== task.id);
        updatePendingTasks();
      });
      listItem.appendChild(moreInfoInput);
      listItem.appendChild(deleteButton);
      listItem.appendChild(completeButton);
      sortableList.appendChild(listItem);
    }
  
    async function updatePendingTasks() {
      sortableList.innerHTML = "";
      tareasPendientes.forEach(addTaskToUI);
    }
  
    async function init() {
      await generateMonthDays(currentMonth, currentYear);
      tareasPendientes = await fetchTasks();
      updatePendingTasks();
    }
  
    addTaskButton.addEventListener("click", () => {
      taskInputOverlay.style.display = "block";
    });
  
    cancelTaskButton.addEventListener("click", () => {
      taskTextInput.value = "";
      taskInputOverlay.style.display = "none";
    });
  
    saveTaskButton.addEventListener("click", async () => {
      const taskText = taskTextInput.value.trim();
      if (taskText) {
        const newTask = { description: taskText };
        await saveTask(newTask);
        tareasPendientes.push(newTask);
        taskTextInput.value = "";
        taskInputOverlay.style.display = "none";
        updatePendingTasks();
      }
    });
  
    closePopupButton.addEventListener("click", closePopup);
  
    init();
  });
  