import {
  fetchNotesForDate,
  saveNotesForDate,
  completeNoteForDate,
} from "./db_connections.js";

document.addEventListener("DOMContentLoaded", function () {
  const weekdays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const calendar = document.getElementById("calendar");
  const daysContainer = document.getElementById("days-container");
  const monthYearElement = document.getElementById("month-year");
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  const popupOverlay = document.getElementById("popup-overlay");
  const closePopupButton = document.getElementById("close-popup");
  const saveTimeButton = document.getElementById("save-time");
  const proximosContainer = document.getElementById("proximos");
  let selectedDate = "";

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
    const days = daysContainer.children;
    let rows = 0;
    for (let i = 0; i < days.length; i += 7) {
      if (days[i].style.visibility !== "hidden") {
        rows++;
      }
    }

    // Ajusta la altura del calendario según el número de filas visibles
    if (rows === 4) {
      calendar.style.height = "calc(100vw / 7 * 4 + 50px)"; // Ajusta según tus necesidades
    } else if (rows === 5) {
      calendar.style.height = "calc(100vw / 7 * 5 + 50px)"; // Ajusta según tus necesidades
    } else {
      calendar.style.height = "calc(100vw / 7 * 6 + 50px)"; // Por defecto para 6 filas
    }
    daysContainer.innerHTML = "";

    // Añadir los días de la semana
    weekdays.forEach((day) => {
      const weekdayElement = document.createElement("div");
      weekdayElement.classList.add("weekday");
      weekdayElement.textContent = day;
      daysContainer.appendChild(weekdayElement);
    });

    // Calcular el primer día del mes
    const firstDay = new Date(year, month, 1);
    const startingDay = (firstDay.getDay() + 6) % 7; // Convertir el primer día al formato de lunes a domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let dayOfMonth = 1;

    // Generar los días del mes
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

          // Número de día
          const dayNumber = document.createElement("span");
          dayNumber.classList.add("day-number");
          dayNumber.textContent = dayOfMonth;
          dayElement.appendChild(dayNumber);

          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            dayOfMonth
          ).padStart(2, "0")}`;
          const notes = await fetchNotesForDate(date);
          const notesCount = notes.length;

          // Número de eventos
          // if (notesCount > 0) {
          //   const notesCountElement = document.createElement("span");
          //   notesCountElement.classList.add("notes-count");
          //   notesCountElement.textContent = notesCount;
          //   dayElement.appendChild(notesCountElement);
          // }

          // Primeros 10 caracteres de los eventos
          if (notesCount > 0) {
            const notesPreview = document.createElement("div");
            notesPreview.classList.add("notes-preview");
            notesPreview.textContent = notes
              .map((note) => note.texto.slice(0, 20))
              .join("<br>");
            dayElement.appendChild(notesPreview);
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
      noteItem.textContent = `${note.hora.slice(0, 5)} ${note.texto}`;
      const moreInfoButtonCal = document.createElement("span");
      moreInfoButtonCal.textContent = " + ";
      moreInfoButtonCal.classList.add("more-info-span");
      moreInfoButtonCal.style.cursor = "pointer";
      moreInfoButtonCal.addEventListener("click", function () {
        alert(note.mas_info);
      });
      const completeSpanCal = document.createElement("span");
      completeSpanCal.textContent = " ✔ ";
      completeSpanCal.classList.add("complete-span");
      completeSpanCal.style.cursor = "pointer";
      completeSpanCal.addEventListener("click", async function () {
        await completeNoteForDate(note.id);
        notesList.removeChild(noteItem);
        initialize();
      });
      noteItem.appendChild(moreInfoButtonCal);
      noteItem.appendChild(completeSpanCal);
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
      showNotification("El campo de hora no puede estar vacío.", "blue");
      return;
    }
    if (!noteText) {
      showNotification("El campo de texto no puede estar vacío", "blue");
      return;
    }
    const note = {
      hour,
      text: noteText,
      moreInfo: "",
    };
    const notes = await fetchNotesForDate(selectedDate);
    notes.push(note);
    await saveNotesForDate(selectedDate, notes);
    displayDayNotes(selectedDate);
    initialize();
  });

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
    const today = new Date();
    const mañana = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const pasadoMañana = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 2
    );
    const datesToCheck = [today, mañana, pasadoMañana];
    for (const date of datesToCheck) {
      const formattedDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const notes = await fetchNotesForDate(formattedDate);
      notes.forEach((note) => {
        const noteTime = new Date(`${formattedDate}T${note.hora}`);
        const currentTime = new Date();
        if (noteTime > currentTime) {
          const eventItem = document.createElement("div");
          eventItem.classList.add("proximo-evento");
          const eventDateTime = document.createElement("div");
          eventDateTime.classList.add("event-date-text");
          const hoyFormateado = `${today.getFullYear()}-${String(
            today.getMonth() + 1
          ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          const mañanaFormateado = `${mañana.getFullYear()}-${String(
            mañana.getMonth() + 1
          ).padStart(2, "0")}-${String(mañana.getDate()).padStart(2, "0")}`;
          const pasadoMañanaFormateado = `${pasadoMañana.getFullYear()}-${String(
            pasadoMañana.getMonth() + 1
          ).padStart(2, "0")}-${String(pasadoMañana.getDate()).padStart(
            2,
            "0"
          )}`;
          let fechaTexto = "";
          if (formattedDate === hoyFormateado) {
            fechaTexto = "Hoy";
          } else if (formattedDate === mañanaFormateado) {
            fechaTexto = "Mañana";
          } else if (formattedDate === pasadoMañanaFormateado) {
            fechaTexto = "Pasado Mañana";
          }
          const noteHoraSinSegundos = note.hora.slice(0, 5);
          eventDateTime.textContent = `${fechaTexto} ${noteHoraSinSegundos}`;
          const eventText = document.createElement("div");
          eventText.classList.add("event-text");
          eventText.textContent = note.texto;
          eventItem.appendChild(eventDateTime);
          eventItem.appendChild(eventText);
          proximosContainer.appendChild(eventItem);
        }
      });
    }
  }

  // async function updateCalendar() {
  //   await generateMonthDays(currentMonth, currentYear);
  //   monthYearElement.textContent = `${getMonthName(
  //     currentMonth
  //   )} ${currentYear}`;
  //   await updateNextEvents();
  // }

  async function initialize() {
    await generateMonthDays(currentMonth, currentYear);
    monthYearElement.textContent = `${getMonthName(
      currentMonth
    )} ${currentYear}`;
    await updateNextEvents();
  }

  initialize();
});
export function showNotification(message, color) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.add("show");
  notification.style.backgroundColor = color;
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}
