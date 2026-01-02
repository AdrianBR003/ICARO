const API_BASE = "http://localhost:8080/api/news";

export interface CreateNewsData {
  id: string;
  title: string;
  description: string;
  publicationDate?: string | null;
  link?: string | null;
  highlighted?: boolean;
}

export interface CreateNewsResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Verifica si un ID ya existe en la base de datos
 */
export async function checkIdExists(id: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE}/check/${encodeURIComponent(id)}`
    );

    if (response.ok) {
      return await response.json();
    }

    if (response.status === 404) {
      return false;
    }

    console.error("[newsCreateService] Error al verificar ID:", response.status);
    return true; 
  } catch (error) {
    console.error("[newsCreateService] Error de red:", error);
    return true;
  }
}

/**
 * Crea una nueva noticia en el backend
 */
export async function createNews(
  newsData: CreateNewsData,
  authHeaders: HeadersInit
): Promise<CreateNewsResponse> {
  try {
    const response = await fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(newsData),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "Noticia creada exitosamente",
        data,
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
    console.error("[newsCreateService] Error de red:", error);
    return {
      success: false,
      message: `Error de conexión: ${(error as Error).message}`,
    };
  }
}

/**
 * Genera un ID único de 4 dígitos
 */
export function generateId(): string {
  const num = Math.floor(Math.random() * 10000);
  return num.toString().padStart(4, "0");
}

/**
 * Intenta generar un ID único (máximo 5 intentos)
 */
export async function generateUniqueId(): Promise<string | null> {
  let attempts = 0;
  
  while (attempts < 5) {
    attempts++;
    const newId = generateId();
    const exists = await checkIdExists(newId);
    
    if (!exists) {
      return newId;
    }
  }
  
  return null; // No se pudo generar un ID único
}