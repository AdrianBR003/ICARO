import type { OrcidPreviewDTO } from "@/types/orcid";

// Almacén simple de datos en memoria
export const orcidState = {
    // Datos crudos recibidos de ORCID (Paso 1)
    fetchedData: null as OrcidPreviewDTO | null,
    formData: null as any
};

export function resetState() {
    orcidState.fetchedData = null;
    orcidState.formData = null;
}