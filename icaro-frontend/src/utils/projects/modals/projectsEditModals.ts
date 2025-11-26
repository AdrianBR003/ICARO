import { updateProjectService } from "@/services/project/projectEditService";

export function initProjectEditModal() {
  const modal = document.getElementById("project-edit-modal");
  const form = document.getElementById("edit-project-form") as HTMLFormElement;
  const cancelBtn = document.getElementById("cancel-edit-btn");
  const closeBtn = document.getElementById("close-edit-modal");

  // 1. DETECTAR APERTURA Y RELLENAR DATOS
  document.addEventListener("click", (e) => {
    const trigger = (e.target as HTMLElement).closest('[data-modal-trigger="project-edit-modal"]');
    if (trigger) {
      const dataJson = trigger.getAttribute("data-entity-data");
      if (dataJson) {
        try {
          const project = JSON.parse(dataJson);
          populateForm(project);
        } catch (error) {
          console.error("Error parsing project data", error);
        }
      }
    }
  });

  function populateForm(project: any) {
    if (!form) return;
    
    // Asignación directa de campos simples
    (form.elements.namedItem("id") as HTMLInputElement).value = project.id || "";
    (form.elements.namedItem("title") as HTMLInputElement).value = project.title || "";
    (form.elements.namedItem("description") as HTMLInputElement).value = project.description || "";
    (form.elements.namedItem("firstProjectDate") as HTMLInputElement).value = project.firstProjectDate || "";
    (form.elements.namedItem("secondProjectDate") as HTMLInputElement).value = project.secondProjectDate || "";
    
    // Arrays a String (Participants)
    // Nota: El backend envía 'participants' o 'colaborators'? Ajustar según DTO.
    // Asumimos 'colaborators' según tu código anterior, pero el DTO tenía participants.
    const parts = project.participants || project.colaborators || [];
    (form.elements.namedItem("participants") as HTMLInputElement).value = Array.isArray(parts) ? parts.join(", ") : "";
  }

  // 2. CERRAR MODAL
  const closeModal = () => {
    modal?.classList.add("hidden");
    document.body.style.overflow = "";
    if(form) form.reset();
  };

  cancelBtn?.addEventListener("click", closeModal);
  closeBtn?.addEventListener("click", closeModal);
  modal?.querySelector(".modal-overlay")?.addEventListener("click", closeModal);

  // 3. ENVIAR CAMBIOS
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!confirm("¿Guardar cambios?")) return;

      const formData = new FormData(form);
      
      const projectData = {
        id: formData.get("id"), // ID suele ser inmutable, pero necesario para identificar
        title: formData.get("title"),
        description: formData.get("description"),
        participants: (formData.get("participants") as string).split(",").map(s => s.trim()).filter(Boolean),
        firstProjectDate: formData.get("firstProjectDate"),
        secondProjectDate: formData.get("secondProjectDate") || null,
        // Si necesitas editar tags o works aquí, deberías implementar la misma lógica que en Add
      };

      try {
        const response = await updateProjectService(projectData);
        if (response.ok) {
          saveNotification("success", "Proyecto actualizado correctamente.");
          window.location.reload();
        } else {
           const err = await response.text();
           alert(`Error al actualizar: ${err}`);
        }
      } catch (error) {
        alert("Error de conexión");
      }
    });
  }

  function saveNotification(type: string, message: string) {
    const notifications = JSON.parse(localStorage.getItem("pendingNotifications") || "[]");
    notifications.push({ id: Date.now(), message, type, duration: 4000 });
    localStorage.setItem("pendingNotifications", JSON.stringify(notifications));
  }
}