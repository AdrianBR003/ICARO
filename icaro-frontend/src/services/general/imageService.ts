import { API_BASE } from "@/configAPI";

export type EntityType = 'news' | 'projects' | 'investigators' | 'users';

export async function uploadEntityImage(
    entityType: EntityType, 
    id: string, 
    file: File, 
    // CAMBIO: Ahora aceptamos el objeto de cabeceras estándar
    authHeaders: HeadersInit 
): Promise<void> {
    
    if (!file) throw new Error("No se ha seleccionado ningún archivo.");
    
    // Validaciones de tamaño/tipo...
    if (file.size > 5 * 1024 * 1024) throw new Error("La imagen es demasiado pesada (Máx 5MB).");

    const formData = new FormData();
    formData.append("file", file);

    const url = `${API_BASE}/${entityType}/${id}/image`;

    // 1. Convertimos lo que nos llegue a un objeto Headers manipulable
    const requestHeaders = new Headers(authHeaders);
    
    // 2. IMPORTANTE: Borramos 'Content-Type'. 
    // Si viene como 'application/json', rompería la subida.
    // Al borrarlo, el navegador detecta FormData y pone 'multipart/form-data' automáticamente.
    requestHeaders.delete("Content-Type"); 

    console.log(`📤 Subiendo imagen a: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: requestHeaders, 
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText || 'Fallo en la subida'}`);
        }

    } catch (error) {
        console.error(`[ImageService] Fallo al subir imagen de ${entityType}:`, error);
        throw error;
    }
}