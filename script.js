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
  const proximosContainer = document.getElementById("proximos");
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
  async function saveNotesForDate(date, notes) {
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
  async function deleteNoteForDate(date, noteId) {
    try {
      const response = await fetch(
        "http://192.168.1.14/calendar_operations.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "delete_note", date, noteId }),
        }
      );
      if (!response.ok) {
        throw new Error("Error al eliminar la nota.");
      }
    } catch (error) {
      console.error("Error en deleteNoteForDate:", error);
    }
  }
  async function fetchTasks() {
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
  async function saveTask(task) {
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
  async function updateMoreInfo(taskId, newMoreInfo) {
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
        throw new Error("Network response was not ok(update more info)");
      }
      // const data = await response.json();
      // return data;
    } catch (error) {
      console.error("Error updating more info in DB:", error);
    }
  }
  async function deleteTask(taskId) {
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
  async function markTaskAsCompleted(taskId) {
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

          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            dayOfMonth
          ).padStart(2, "0")}`;
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
            selectedDate = date;
            document.getElementById("hour").value = "";
            document.getElementById("note-text").value = "";
            displayDayNotes(date);
            popupOverlay.classList.add("visible");
          });
          if (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            dayOfMonth === today.getDate()
          ) {
            dayElement.classList.add("today");
          }
          daysContainer.appendChild(dayElement);
          dayOfMonth++;
        }
      }
    }
  }

  async function displayDayNotes(date) {
    const notesList = document.getElementById("notes-ul");
    notesList.innerHTML = "";
    const notes = await fetchNotesForDate(date);
    notes.sort((a, b) => {
      if (a.hour < b.hour) return -1;
      if (a.hour > b.hour) return 1;
      return 0;
    });
    notes.forEach((note) => {
      const noteItem = document.createElement("li");
      noteItem.textContent = `${note.hora}: ${note.texto}`;
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "X";
      deleteButton.classList.add("delete-button");
      deleteButton.addEventListener("click", async function () {
        await deleteNoteForDate(date, note.id);
        notesList.removeChild(noteItem);
        updateCalendar();
      });
      const moreInfoButton = document.createElement("button");
      moreInfoButton.textContent = "+";
      moreInfoButton.classList.add("more-info-button");
      moreInfoButton.addEventListener("click", function () {
        alert(note.mas_info);
      });
      noteItem.appendChild(deleteButton);
      noteItem.appendChild(moreInfoButton);
      notesList.appendChild(noteItem);
    });
  }
  function closePopup() {
    popupOverlay.classList.remove("visible");
  }
  closePopupButton.addEventListener("click", function () {
    closePopup();
  });
  saveTimeButton.addEventListener("click", async function () {
    const hour = document.getElementById("hour").value;
    const noteText = document.getElementById("note-text").value;
    if (!hour) {
      showNotification("El campo de hora no puede estar vacío.");
      return;
    }
    if (!noteText) {
      showNotification("El campo de texto no puede estar vacío");
      return;
    }
    const note = {
      id: Date.now(),
      hour,
      text: noteText,
      moreInfo: "",
    };
    const notes = await fetchNotesForDate(selectedDate);
    notes.push(note);
    await saveNotesForDate(selectedDate, notes);
    displayDayNotes(selectedDate);
    updateCalendar();
  });
  function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.classList.remove("hidden");
    setTimeout(() => {
      notification.classList.add("hidden");
    }, 3000);
  }
  addTaskButton.addEventListener("click", function () {
    taskInputOverlay.classList.add("visible");
  });
  cancelTaskButton.addEventListener("click", function () {
    taskInputOverlay.classList.remove("visible");
  });
  saveTaskButton.addEventListener("click", async function () {
    const taskText = taskTextInput.value;
    if (!taskText) {
      alert("La descripción de la tarea no puede estar vacía.");
      return;
    }
    const task = {
      text: taskText,
      moreInfo: "",
      completed: false,
    };
    tareasPendientes.push(task);
    taskTextInput.value = "";
    taskInputOverlay.classList.remove("visible");
    await saveTask(task);
    updatePendingTasks();
  });
  function updatePendingTasks() {
    // pendingTasksContainer.innerHTML = "";
    sortableList.innerHTML = "";
    const sortedTasks = [...tareasPendientes].sort(
      (a, b) => a.position - b.position
    );
    const currentTime = new Date();
    sortedTasks.forEach(async (task) => {
      const li = createTaskElement(task);
      if (task.completed == 1) {
        li.style.backgroundColor = "#d4edda";
      } else if (task.completed == 2) {
        const completionTime = new Date(task.completedAt);
        const hoursSinceCompletion =
          (currentTime - completionTime) / (1000 * 60 * 60);
        if (hoursSinceCompletion < 1) {
          li.style.backgroundColor = "grey";
        } else {
          await deleteTask(task.id);
        }
      }
      sortableList.appendChild(li);
    });
    initializeSortable();
  }
  function createTaskElement(task) {
    const li = document.createElement("li");
    li.classList.add("ui-state-default");
    li.textContent = task.text;
    li.id = task.id;
    const moreInfoSpan = createMoreInfoSpan(task, li);
    const completeSpan = createCompleteSpan(task, li);
    li.appendChild(moreInfoSpan);
    li.appendChild(completeSpan);
    return li;
  }
  function createMoreInfoSpan(task, li) {
    const moreInfoSpan = document.createElement("span");
    moreInfoSpan.textContent = " + ";
    moreInfoSpan.classList.add("more-info-span");
    moreInfoSpan.style.cursor = "pointer";
    moreInfoSpan.id = "moreInfoSpan_" + task.id;
    
    moreInfoSpan.addEventListener("click", () => {
        const moreInfoDivId = "moreInfo_" + task.id;
        const editCampoMoreInfoId = "editCampo_" + task.id;
        const saveButtonId = "saveButton_" + task.id;
        const editMoreInfoLinkId = "editMoreInfoLink_" + task.id;
        const moreInfoDiv = document.getElementById(moreInfoDivId);
        const editMoreInfoLink = document.getElementById(editMoreInfoLinkId);

        removeEditField(li, editCampoMoreInfoId, saveButtonId);
        
        if (li.contains(moreInfoDiv)) {
            li.removeChild(moreInfoDiv);
            if (li.contains(editMoreInfoLink)) {
                li.removeChild(editMoreInfoLink);
            }
        } else {
            const newMoreInfoDiv = createMoreInfoDiv(task, moreInfoDivId);
            li.appendChild(newMoreInfoDiv);
            
            if (!li.contains(editMoreInfoLink)) {
                const newEditMoreInfoLink = document.createElement("span");

                newEditMoreInfoLink.textContent = "editar";
                newEditMoreInfoLink.classList.add("edit-more-info-span");
                newEditMoreInfoLink.style.cursor = "pointer";
                newEditMoreInfoLink.id = editMoreInfoLinkId;

                newEditMoreInfoLink.addEventListener("click", () => {
                    displayEditField(
                        task,
                        li,
                        editCampoMoreInfoId,
                        saveButtonId,
                        newEditMoreInfoLink
                    );

                    if (li.contains(newEditMoreInfoLink)) {
                        li.removeChild(newEditMoreInfoLink);
                    } else {
                        li.appendChild(newEditMoreInfoLink);
                    }
                });

                li.appendChild(newEditMoreInfoLink);
            }
        }
    });

    return moreInfoSpan;
}


  function createCompleteSpan(task, li) {
    const completeSpan = document.createElement("span");
    completeSpan.textContent = " ✔ ";
    completeSpan.classList.add("complete-span");
    completeSpan.style.cursor = "pointer";
    completeSpan.id = "completeSpan_" + task.id;
    completeSpan.addEventListener("click", async () => {
      if (!task.completed) {
        task.completed = 1;
        li.style.backgroundColor = "#d4edda";
      } else if (task.completed == 1) {
        task.completed = 2;
        li.style.backgroundColor = "grey";
      } else {
        task.completed = 0;
        li.style.backgroundColor = "";
      }
      await markTaskAsCompleted(task.id);
    });
    return completeSpan;
  }
  function createMoreInfoDiv(task, moreInfoDivId) {
    const moreInfoDiv = document.createElement("div");
    // moreInfoDiv.textContent = task.moreInfo;
    moreInfoDiv.id = moreInfoDivId;
    moreInfoDiv.style.display = "block";
    moreInfoDiv.style.whiteSpace = "pre-line"; // Para mantener los saltos de línea

    // Reemplazar saltos de línea con etiquetas <br> para HTML
    const htmlContent = task.moreInfo.replace(/\n/g, "<br>");
    moreInfoDiv.innerHTML = htmlContent;
    return moreInfoDiv;
  }
  function displayEditField(
    task,
    li,
    editCampoMoreInfoId,
    saveButtonId,
    newEditMoreInfoLink
  ) {
    const moreInfoDiv = document.getElementById("moreInfo_" + task.id);
    if (moreInfoDiv && li.contains(moreInfoDiv)) {
      li.removeChild(moreInfoDiv);
    }
    const editCampoMoreInfo = document.createElement("textarea");
    editCampoMoreInfo.value = task.moreInfo;
    editCampoMoreInfo.id = editCampoMoreInfoId;
    editCampoMoreInfo.style.width = "80%";
    // editCampoMoreInfo.style.height = "100px";
    editCampoMoreInfo.style.display = "block";
    editCampoMoreInfo.rows = "10";

    li.appendChild(editCampoMoreInfo);
    const saveButton = createSaveButton(
      task,
      li,
      editCampoMoreInfo,
      saveButtonId,
      newEditMoreInfoLink
    );
    li.appendChild(saveButton);
  }

  function createSaveButton(
    task,
    li,
    editCampoMoreInfo,
    saveButtonId,
    newEditMoreInfoLink
  ) {
    const saveButton = document.createElement("button");
    saveButton.textContent = "Guardar";
    saveButton.id = saveButtonId;
    saveButton.style.display = "block";
    saveButton.addEventListener("click", async () => {
      task.moreInfo = editCampoMoreInfo.value;
      const updatedMoreInfoDiv = document.createElement("div");
      updatedMoreInfoDiv.style.whiteSpace = "pre-line"; // Para mantener los saltos de línea
      // Reemplazar saltos de línea con etiquetas <br> para HTML
      const htmlContent = task.moreInfo.replace(/\n/g, "<br>");
      updatedMoreInfoDiv.innerHTML = htmlContent;
      updatedMoreInfoDiv.id = "moreInfo_" + task.id;
      updatedMoreInfoDiv.style.display = "block";
      const existingMoreInfoDiv = document.getElementById(
        "moreInfo_" + task.id
      );
      if (existingMoreInfoDiv) {
        li.replaceChild(updatedMoreInfoDiv, existingMoreInfoDiv);
      } else {
        li.appendChild(updatedMoreInfoDiv);
        li.appendChild(newEditMoreInfoLink);
      }
      removeEditField(li, editCampoMoreInfo.id, saveButton.id);
      // await saveNotesForDate("tareasPendientes", tareasPendientes);
      await updateMoreInfo(task.id, task.moreInfo);
    });
    return saveButton;
  }
  function removeEditField(li, editCampoMoreInfoId, saveButtonId) {
    const editCampoMoreInfo = document.getElementById(editCampoMoreInfoId);
    if (editCampoMoreInfo && li.contains(editCampoMoreInfo)) {
      li.removeChild(editCampoMoreInfo);
    }
    const saveButton = document.getElementById(saveButtonId);
    if (saveButton && li.contains(saveButton)) {
      li.removeChild(saveButton);
    }
  }
  function initializeSortable() {
    $(function () {
      $("#sortable").sortable({
        update: function (event, ui) {
          const newOrder = $(this).sortable("toArray");
          const oldIndex = ui.item.data("oldIndex");
          const newIndex = ui.item.index();
          updateTaskOrder(newOrder, oldIndex, newIndex);
        },
        start: function (event, ui) {
          ui.item.data("oldIndex", ui.item.index());
        },
      });
      $("#sortable").disableSelection();
    });
  }

  async function loadAllPendingTasks() {
    tareasPendientes = [];
    const tasks = await fetchTasks();
    tasks.forEach((task) => {
      const pendingTask = {
        id: task.id,
        text: task.texto,
        moreInfo: task.mas_info,
        completed: task.completada,
        position: task.posicion,
        completedAt: task.fecha_completado,
      };
      if (!task.completed) {
        tareasPendientes.push(pendingTask);
      }
    });
    updatePendingTasks();
  }
  async function initialize() {
    await generateMonthDays(currentMonth, currentYear);
    monthYearElement.textContent = `${getMonthName(
      currentMonth
    )} ${currentYear}`;
    await loadAllPendingTasks();
    await updateNextEvents();
  }
  initialize();
  document.getElementById("prev-month").addEventListener("click", function () {
    changeMonth(-1);
  });
  document.getElementById("next-month").addEventListener("click", function () {
    changeMonth(1);
  });
  document.getElementById("prev-year").addEventListener("click", function () {
    changeMonth(-12);
  });
  document.getElementById("next-year").addEventListener("click", function () {
    changeMonth(12);
  });
  function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    } else if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    initialize();
  }
  async function updateNextEvents() {
    proximosContainer.innerHTML = "";
    const allNotes = [];

    // Fetch all tasks for the current month and year
    for (
      let day = 1;
      day <= new Date(currentYear, currentMonth + 1, 0).getDate();
      day++
    ) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const notes = await fetchNotesForDate(date);
      allNotes.push(...notes.map((note) => ({ ...note, date })));
    }

    // Sort notes by date and hour
    allNotes.sort((a, b) => {
      const dateComparison = new Date(a.date) - new Date(b.date);
      if (dateComparison !== 0) return dateComparison;
      return a.hora.localeCompare(b.hora);
    });

    // Display up to 5 upcoming events
    const upcomingNotes = allNotes.slice(0, 5);
    upcomingNotes.forEach((note) => {
      const eventItem = document.createElement("div");
      eventItem.classList.add("proximo-evento");

      const eventDateTime = document.createElement("div");
      eventDateTime.classList.add("event-date-time");
      eventDateTime.textContent = `${note.date} ${note.hora}`;

      const eventText = document.createElement("div");
      eventText.classList.add("event-text");
      eventText.textContent = note.texto;

      eventItem.appendChild(eventDateTime);
      eventItem.appendChild(eventText);
      proximosContainer.appendChild(eventItem);
    });
  }
  async function updateCalendar() {
    await generateMonthDays(currentMonth, currentYear);
    monthYearElement.textContent = `${getMonthName(
      currentMonth
    )} ${currentYear}`;
    await updateNextEvents();
  }
});
