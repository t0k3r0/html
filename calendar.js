import {
  fetchNotesForDate,
  saveNotesForDate,
  deleteNoteForDate,
} from "./db_connections.js";

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
//   const pendingTasksContainer = document.getElementById("pendientes");
//   const taskInputOverlay = document.getElementById("task-input-overlay");
//   const taskTextInput = document.getElementById("task-text");
//   const addTaskButton = document.getElementById("add-task");
//   const saveTaskButton = document.getElementById("save-task");
//   const cancelTaskButton = document.getElementById("cancel-task");
//   const sortableList = document.getElementById("sortable");
  const proximosContainer = document.getElementById("proximos");
  let selectedDate = "";
//   let tasks = {};
//   let tareasPendientes = [];
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
  async function initialize() {
    await generateMonthDays(currentMonth, currentYear);
    monthYearElement.textContent = `${getMonthName(
      currentMonth
    )} ${currentYear}`;
    // await loadAllPendingTasks();
    await updateNextEvents();
  }
  initialize();
});
