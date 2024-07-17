document.addEventListener("DOMContentLoaded", function () {
  // Tu código existente...

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
      if (moreInfoDiv) {
        li.removeChild(moreInfoDiv);
      }
      if (editMoreInfoLink) {
        li.removeChild(editMoreInfoLink);
      }
      removeEditField(li, editCampoMoreInfoId, saveButtonId);
      const newMoreInfoDiv = createMoreInfoDiv(task, moreInfoDivId);
      li.appendChild(newMoreInfoDiv);
      const newEditMoreInfoLink = document.createElement("span");
      newEditMoreInfoLink.textContent = "editar";
      newEditMoreInfoLink.classList.add("edit-more-info-span");
      newEditMoreInfoLink.style.cursor = "pointer";
      newEditMoreInfoLink.id = editMoreInfoLinkId;
      newEditMoreInfoLink.addEventListener("click", () => {
        displayEditField(task, li, editCampoMoreInfoId, saveButtonId);
        if (li.contains(newEditMoreInfoLink)) {
          li.removeChild(newEditMoreInfoLink);
        }
      });
      li.appendChild(newEditMoreInfoLink);
    });
    return moreInfoSpan;
  }

  function displayEditField(task, li, editCampoMoreInfoId, saveButtonId) {
    const moreInfoDiv = document.getElementById("moreInfo_" + task.id);
    if (moreInfoDiv && li.contains(moreInfoDiv)) {
      li.removeChild(moreInfoDiv);
    }
    const editCampoMoreInfo = document.createElement("textarea");
    editCampoMoreInfo.value = task.moreInfo;
    editCampoMoreInfo.id = editCampoMoreInfoId;
    editCampoMoreInfo.style.width = "100%";
    editCampoMoreInfo.style.height = "100px";
    editCampoMoreInfo.style.display = "block";
    li.appendChild(editCampoMoreInfo);

    // Inicializar CKEditor en el textarea
    CKEDITOR.replace(editCampoMoreInfoId);

    const saveButton = createSaveButton(task, li, editCampoMoreInfo, saveButtonId);
    li.appendChild(saveButton);
  }

  function createSaveButton(task, li, editCampoMoreInfo, saveButtonId) {
    const saveButton = document.createElement("button");
    saveButton.textContent = "Guardar";
    saveButton.id = saveButtonId;
    saveButton.style.display = "block";
    saveButton.addEventListener("click", async () => {
      // Obtener el contenido desde CKEditor
      const editorData = CKEDITOR.instances[editCampoMoreInfo.id].getData();
      task.moreInfo = editorData;

      const updatedMoreInfoDiv = document.createElement("div");
      updatedMoreInfoDiv.innerHTML = task.moreInfo; // Usar innerHTML para preservar el formato
      updatedMoreInfoDiv.id = "moreInfo_" + task.id;
      updatedMoreInfoDiv.style.display = "block";

      const existingMoreInfoDiv = document.getElementById("moreInfo_" + task.id);
      if (existingMoreInfoDiv) {
        li.replaceChild(updatedMoreInfoDiv, existingMoreInfoDiv);
      } else {
        li.appendChild(updatedMoreInfoDiv);
      }
      removeEditField(li, editCampoMoreInfo.id, saveButton.id);
      await updateMoreInfo(task.id, task.moreInfo);
      // Destruir la instancia de CKEditor para el textarea eliminado
      CKEDITOR.instances[editCampoMoreInfo.id].destroy();
    });
    return saveButton;
  }

  // Tu código existente...
});
