import {
  fetchTasks,
  saveTask,
  updateMoreInfo,
  deleteTask,
  markTaskAsCompleted,
  updateTaskOrder,
} from "./db_connections.js";

document.addEventListener("DOMContentLoaded", function () {
  // const testTextarea = document.createElement("textarea");
  // testTextarea.style.position = "fixed";
  // testTextarea.style.bottom = "10px";
  // testTextarea.style.left = "10px";
  // testTextarea.style.width = "200px";
  // testTextarea.style.height = "100px";
  // document.body.appendChild(testTextarea);
  // const weekdays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  //   const daysContainer = document.getElementById("days-container");
  // const monthYearElement = document.getElementById("month-year");
  // const today = new Date();
  // let currentMonth = today.getMonth();
  // let currentYear = today.getFullYear();
  //   const popupOverlay = document.getElementById("popup-overlay");
  //   const closePopupButton = document.getElementById("close-popup");
  //   const saveTimeButton = document.getElementById("save-time");
  //   const pendingTasksContainer = document.getElementById("pendientes");
  const taskInputOverlay = document.getElementById("task-input-overlay");
  const taskTextInput = document.getElementById("task-text");
  const addTaskButton = document.getElementById("add-task");
  const saveTaskButton = document.getElementById("save-task");
  const cancelTaskButton = document.getElementById("cancel-task");
  const sortableList = document.getElementById("sortable");
  //   const proximosContainer = document.getElementById("proximos");
  //   let selectedDate = "";
  //   let tasks = {};
  let tareasPendientes = [];
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
      const tarea = createTaskElement(task);
      if (task.completed == 1) {
        tarea.style.backgroundColor = "#d4edda";
      } else if (task.completed == 2) {
        const completionTime = new Date(task.completedAt);
        const hoursSinceCompletion =
          (currentTime - completionTime) / (1000 * 60 * 60);
        if (hoursSinceCompletion < 1) {
          tarea.style.backgroundColor = "grey";
        } else {
          await deleteTask(task.id);
        }
      }
      sortableList.appendChild(tarea);
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
    $("#sortable").sortable("disable");
    const editCampoMoreInfo = document.createElement("textarea");
    editCampoMoreInfo.value = task.moreInfo;
    editCampoMoreInfo.id = editCampoMoreInfoId;
    editCampoMoreInfo.style.width = "100%";
    // editCampoMoreInfo.style.height = "100px";
    editCampoMoreInfo.style.display = "block";
    // editCampoMoreInfo.style.position = "fixed";
    // editCampoMoreInfo.style.bottom = "10px";
    // editCampoMoreInfo.style.left = "10px";
    // editCampoMoreInfo.style.width = "200px";
    // editCampoMoreInfo.style.height = "100px";
    editCampoMoreInfo.rows = "10";
    // document.body.appendChild(editCampoMoreInfo);

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
      $("#sortable").sortable("enable");
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
        cancel: "textarea", // Permite que los textarea sean editables
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

      // Deshabilitar la selección para elementos no textarea
      $("#sortable li").not("textarea").disableSelection();

      // Asegura que el textarea pueda ser editado en dispositivos móviles
      $("#sortable").on("focus", "textarea", function () {
        $("#sortable").sortable("disable");
      });

      $("#sortable").on("blur", "textarea", function () {
        $("#sortable").sortable("enable");
      });
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
    // await generateMonthDays(currentMonth, currentYear);
    // monthYearElement.textContent = `${getMonthName(
    //   currentMonth
    // )} ${currentYear}`;
    await loadAllPendingTasks();
    // await updateNextEvents();
  }
  initialize();
});
