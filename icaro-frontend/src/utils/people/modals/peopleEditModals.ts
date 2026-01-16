import { modalStore, modalActions } from "@/stores/modalStore";
import { updatePersonService } from "@/services/people/peopleEditService";
import { uploadEntityImage } from "@/services/general/imageService"; // <--- IMPORTANTE

export function initPeopleEditModal() {
  const form = document.getElementById("edit-people-form") as HTMLFormElement;
  const cancelBtn = document.getElementById("cancel-edit-btn");
  
  // Referencias a los elementos de imagen
  const previewImg = document.getElementById("edit-people-preview") as HTMLImageElement;
  const fileInput = document.getElementById("edit-people-file") as HTMLInputElement;
  const hiddenImageInput = document.getElementById("edit-imageName") as HTMLInputElement;

  // 1. CERRAR MODAL
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      modalActions.close();
    });
  }

  if (!form) return;

  // 2. SUSCRIPCIÓN: Rellenar datos al abrir
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'edit' && state.data) {
      populateForm(form, state.data, previewImg, hiddenImageInput, fileInput);
    }
  });

  // 3. SUBMIT
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!confirm("¿Guardar cambios?")) return;

    // Recuperar utilidades globales
    const addNotification = (window as any).addNotification || alert;
    const getAuthHeaders = (window as any).getAuthHeaders;

    if (!getAuthHeaders) {
        console.error("No se encontraron cabeceras de autenticación");
        return;
    }

    const formData = new FormData(form);

    // Preparar objeto JSON (incluyendo el imageName del input oculto)
    const personData = {
      orcid: formData.get("orcid"),
      givenNames: formData.get("givenNames"),
      familyName: formData.get("familyName"),
      email: formData.get("email"),
      role: formData.get("role"),
      office: formData.get("office"),
      phone: formData.get("phone"),
      biography: formData.get("biography"),
      imageName: formData.get("imageName") // <--- VITAL: Enviamos el nombre actual
    };

    try {
      addNotification("info", "Guardando datos...");

      // PASO A: Actualizar datos de texto
      const response = await updatePersonService(personData);

      if (response.ok) {
        
        // PASO B: Si hay fichero nuevo, subir la imagen
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            addNotification("info", "Subiendo nueva imagen...");
            try {
                // 'investigators' debe coincidir con la ruta de tu controlador Backend
                const orcid = personData.orcid as string;
                await uploadEntityImage('investigators', orcid, fileInput.files[0], getAuthHeaders());
                console.log("✅ Imagen actualizada");
            } catch (error: any) {
                console.error("❌ Error subiendo imagen:", error);
                addNotification("warning", "Texto guardado, pero falló la imagen: " + error.message);
            }
        }

        addNotification("success", "Investigador actualizado correctamente.");
        modalActions.close();
        setTimeout(() => window.location.reload(), 500);

      } else {
        const err = await response.text();
        addNotification("error", `Error al guardar: ${err}`);
      }
    } catch (error) {
      console.error(error);
      addNotification("error", "Error de conexión con el servidor.");
    }
  });
}

/**
 * Rellena el formulario y configura la previsualización de imagen
 */
function populateForm(
    form: HTMLFormElement, 
    data: any, 
    previewImg: HTMLImageElement, 
    hiddenImageInput: HTMLInputElement,
    fileInput: HTMLInputElement
) {
  const setVal = (name: string, val: any) => {
    const input = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
    if (input) input.value = val || "";
  };

  // 1. Campos de Texto
  setVal("orcid", data.orcid);
  setVal("givenNames", data.givenNames);
  setVal("familyName", data.familyName);
  setVal("email", data.email);
  setVal("role", data.role);
  setVal("office", data.office);
  setVal("phone", data.phone);
  setVal("biography", data.biography);

  // 2. Campo Oculto de Imagen (Para persistencia)
  // Nota: data.imageName viene del botón "Editar" en la tarjeta (asegúrate de que PeopleCard lo pase)
  if (hiddenImageInput) {
      hiddenImageInput.value = data.imageName || "";
  }

  // 3. Previsualización Visual
  if (previewImg) {
      if (data.imageName) {
          // Si tiene imagen, usar ruta de Nginx
          previewImg.src = `/uploads/people/${data.imageName}`;
      } else {
          // Si no, usar default
          previewImg.src = "/assets/people/default-profile.png";
      }
  }

  // 4. Limpiar input de archivo (por si quedó sucio de la edición anterior)
  if (fileInput) {
      fileInput.value = "";
  }
}