import type { PeoplePageDTO, UpdatePersonData, UpdatePersonResponse } from "@/types/people";
import { API_BASE } from "@/configAPI";

/**
 * Obtiene investigadores paginados y filtrados por nombre/apellido.
 * Endpoint: GET /api/investigators/paged?page=0&size=8&query=...
 */
export async function fetchPeoplePaged(
  page: number,
  size: number,
  query: string = ""
): Promise<PeoplePageDTO> {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString()); 

    if (query.trim() !== "") {
      params.append("query", query);
    }

    const response = await fetch(`${API_BASE}/investigators/paged?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching people:", error);
    
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: size,
      last: true,
      first: true,
      empty: true
    };
  }
}

/**
 * Actualiza los datos de texto de un investigador.
 */
export async function updatePerson(
  personData: UpdatePersonData,
  authHeaders: HeadersInit
): Promise<UpdatePersonResponse> {
  try {
    const response = await fetch(`${API_BASE}/save/${personData.id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(personData),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "Investigador actualizado correctamente",
        data,
      };
    }

    // Manejo de errores estándar
    if (response.status === 404) {
      return { success: false, message: "El investigador no existe" };
    }
    if (response.status === 401 || response.status === 403) {
      return { success: false, message: "Permisos insuficientes" };
    }

    let errorMessage = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = await response.text() || errorMessage;
    }

    return { success: false, message: errorMessage };

  } catch (error) {
    console.error("[peopleEditService] Error:", error);
    return {
      success: false,
      message: "Error de conexión con el servidor",
    };
  }
}