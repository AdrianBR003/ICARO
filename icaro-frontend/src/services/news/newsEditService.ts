import { API_BASE } from "@/configAPI";

export interface UpdateNewsData {
  id: string;
  title: string;
  description: string;
  publicationDate?: string | null;
  link?: string | null;
  highlighted?: boolean;
}

export interface UpdateNewsResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function updateNews(
  newsData: UpdateNewsData,
  authHeaders: HeadersInit
): Promise<UpdateNewsResponse> {
  try {
    const response = await fetch(`${API_BASE}/news/update`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(newsData),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "Noticia actualizada exitosamente",
        data,
      };
    }

    // Manejar errores específicos
    if (response.status === 404) {
      return {
        success: false,
        message: "La noticia no existe o fue eliminada",
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "No tiene permisos para actualizar esta noticia",
      };
    }

    // Intentar parsear mensaje de error
    let errorMessage = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = await response.text() || errorMessage;
    }

    return {
      success: false,
      message: errorMessage,
    };

  } catch (error) {
    console.error("[newsUpdateService] Error de red:", error);
    return {
      success: false,
      message: `Error de conexión: ${(error as Error).message}`,
    };
  }
}