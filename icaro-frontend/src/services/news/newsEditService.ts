// /services/news/newsEditService.ts


import { API_BASE } from "@/configAPI";

export interface UpdateNewsData {
  id: string;
  title: string;
  description: string;
  publicationDate?: string | null;
  link?: string | null;
  highlighted?: boolean;
  imageName?: string | null;  
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
    const response = await fetch(`${API_BASE}/news/save/${newsData.id}`, {
      method: "PUT", 
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

    if (response.status === 404) {
      return {
        success: false,
        message: "La noticia no existe o fue eliminada",
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "Sesión expirada o permisos insuficientes",
      };
    }

    // Intentar leer el mensaje de error del backend
    let errorMessage = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      // Buscamos mensaje en varios formatos comunes
      errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
    } catch {
      // Si no es JSON, leemos texto plano
      const textError = await response.text();
      if (textError) errorMessage = textError;
    }

    return {
      success: false,
      message: errorMessage,
    };

  } catch (error) {
    console.error("[newsEditService] Error de red:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor. Verifique su conexión.",
    };
  }
}