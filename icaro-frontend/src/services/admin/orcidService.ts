import type { OrcidPreviewDTO } from "@/types/orcid";

const API_BASE = "http://localhost:8080/api/auth/orcid-test";

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
        const response = await fetch(`${API_BASE}/preview/${orcidId}`, {
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