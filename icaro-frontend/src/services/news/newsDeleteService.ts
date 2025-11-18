// services/news/newsDeleteService.ts

const API_BASE = "http://localhost:8080/api/news";

export interface DeleteNewsResponse {
  success: boolean;
  message: string;
}

/**
 * Elimina una noticia del backend
 */
export async function deleteNews(
  newsId: string,
  authHeaders: HeadersInit
): Promise<DeleteNewsResponse> {
  try {
    const response = await fetch(`${API_BASE}/delete/${newsId}`, {
      method: "DELETE",
      headers: authHeaders,
    });

    if (response.ok) {
      return {
        success: true,
        message: "Noticia eliminada exitosamente",
      };
    }

    // Manejar errores específicos
    if (response.status === 404) {
      return {
        success: false,
        message: "La noticia no existe o ya fue eliminada",
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "No tiene permisos para eliminar esta noticia",
      };
    }

    if (response.status === 409) {
      return {
        success: false,
        message: "No se puede eliminar: tiene dependencias asociadas",
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
    console.error("[newsDeleteService] Error de red:", error);
    return {
      success: false,
      message: `Error de conexión: ${(error as Error).message}`,
    };
  }
}

/**
 * Verifica si el usuario tiene permisos de administrador
 */
export async function verifyAdminPermissions(): Promise<boolean> {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return false;

    const response = await fetch("http://localhost:8080/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      return data.authenticated && data.isAdmin;
    } else {
      localStorage.removeItem("adminToken");
      return false;
    }
  } catch (error) {
    console.error("[newsDeleteService] Error verificando permisos:", error);
    return false;
  }
}

/**
 * Limpia la caché de imágenes para una noticia eliminada
 */
export function clearImageCache(newsId: string) {
  if (typeof window !== 'undefined' && (window as any).imageCache) {
    const cache = (window as any).imageCache;
    if (newsId) {
      cache.delete(newsId);
    }
  }
}