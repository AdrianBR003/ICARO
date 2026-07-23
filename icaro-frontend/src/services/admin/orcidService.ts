import type { OrcidPreviewDTO } from "@/types/orcid";
import type { AnalyzedWork } from "@/types/orcid";
import { API_BASE } from "@/configAPI";

/**
 * Obtiene la previsualización de datos de un investigador desde ORCID.
 * Maneja la lógica de red y autenticación.
 * * @param orcidId El ID del investigador (ej: 0000-0000-0000-0000)
 * @returns Promesa con los datos del DTO
 * @throws Error con mensaje descriptivo si falla
 */
export async function fetchOrcidPreview(orcidId: string): Promise<OrcidPreviewDTO> {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        throw new Error("No hay sesión activa. Por favor, inicie sesión nuevamente.");
    }

    try {
        const response = await fetch(`${API_BASE}/auth/orcid-test/preview/${orcidId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Manejo de errores HTTP específicos
            switch (response.status) {
                case 404: throw new Error("No se encontró ningún investigador con ese ID en ORCID.");
                case 403: throw new Error("Acceso denegado: No tienes permisos de administrador.");
                case 401: throw new Error("Sesión caducada.");
                case 500: throw new Error("Error interno del servidor al conectar con ORCID.");
                default: throw new Error(`Error inesperado (${response.status})`);
            }
        }

        const data: OrcidPreviewDTO = await response.json();
        return data;

    } catch (error) {
        // Si es un error de red (fetch fallido antes de respuesta)
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            throw new Error("No se pudo conectar con el servidor. Verifique su conexión o si el backend está activo.");
        }
        // Propagamos el error para que el controlador lo muestre
        throw error;
    }
}

export async function importOrcidProfile(data: any): Promise<void> {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error("Sesión caducada");

    const response = await fetch(`${API_BASE}/auth/orcid-test/import`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error("Error al guardar los datos en el servidor.");
    }
}

export async function checkOrcidDuplicates(orcidId: string, works: any[]): Promise<AnalyzedWork[]> {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error("Sesión caducada");

    const response = await fetch(`${API_BASE}/auth/orcid-test/check-duplicates`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orcidId, works })
    });

    if (!response.ok) throw new Error("Error verificando duplicados");
    
    const data = await response.json();
    return data.works;
}