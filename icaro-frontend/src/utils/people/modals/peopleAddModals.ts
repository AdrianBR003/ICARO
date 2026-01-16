import { modalStore, modalActions } from "@/stores/modalStore";
import { createPersonService } from "@/services/people/peopleAddService";
// 1. IMPORTAMOS EL SERVICIO DE IMAGEN
import { uploadEntityImage } from "@/services/general/imageService"; 

export function initPeopleAddModal() {
  const form = document.getElementById("add-people-form") as HTMLFormElement;
  const openBtn = document.getElementById("addPeopleButton");
  const cancelBtn = document.getElementById("cancel-add-btn");
  
  // 2. REFERENCIA AL INPUT DE ARCHIVO
  const fileInput = document.getElementById("add-people-file") as HTMLInputElement;

  // ABRIR
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      modalActions.open('add');
    });
  }

  // CERRAR
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      modalActions.close();
    });
  }

  if (!form) return;

  // LIMPIAR FORM AL ABRIR
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'add') {
      form.reset();
      if (fileInput) fileInput.value = ""; // Limpiamos también el input file
    }
  });

  // SUBMIT
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const addNotification = (window as any).addNotification || alert;
    const getAuthHeaders = (window as any).getAuthHeaders;

    if (!getAuthHeaders) return;

    const formData = new FormData(form);
    
    // Validación básica
    if (!formData.get("orcid") || !formData.get("givenNames") || !formData.get("familyName")) {
        addNotification("error", "Faltan campos obligatorios");
        return;
    }

    const personData = {
      orcid: formData.get("orcid"),
      givenNames: formData.get("givenNames"),
      familyName: formData.get("familyName"),
      email: formData.get("email"),
      role: formData.get("role"),
      office: formData.get("office"),
      phone: formData.get("phone"),
      biography: formData.get("biography")
    };

    try {
      addNotification("info", "Creando investigador...");

      // PASO 1: Crear la entidad de texto
      const response = await createPersonService(personData);

      if (response.ok) {
        
        // PASO 2: Subir la imagen (si el usuario seleccionó una)
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            addNotification("info", "Subiendo imagen...");
            try {
                // Usamos el ORCID como ID y las cabeceras de autenticación
                await uploadEntityImage(
                    'investigators', 
                    personData.orcid as string, 
                    fileInput.files[0], 
                    getAuthHeaders()
                );
                console.log("✅ Imagen subida correctamente");
            } catch (imgError: any) {
                console.error("❌ Error subiendo imagen:", imgError);
                // No lanzamos error fatal, porque el usuario SÍ se creó
                addNotification("warning", "Usuario creado, pero falló la imagen: " + imgError.message);
            }
        }

        addNotification("success", "Investigador añadido correctamente.");
        modalActions.close();
        setTimeout(() => window.location.reload(), 500);

      } else {
        const err = await response.text();
        addNotification("error", `Error: ${err}`);
      }
    } catch (error) {
      console.error(error);
      addNotification("error", "Error al insertar el usuario. Compruebe que el ORCID no existe ya.");
    }
  });
}