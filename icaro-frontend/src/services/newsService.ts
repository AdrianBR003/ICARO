import type { News, NewsPage } from "@/types/news";

// Interfaz para el objeto que llega "crudo" desde el API
interface ApiNewsItem {
  id?: string;
  title?: string;
  description?: string;
  link?: string;
  publicationDate?: string;
  authors?: string;
}

const API_BASE = "http://localhost:8080";

/**
 * Procesa un item de noticia crudo del API.
 * Asigna valores por defecto y asegura que el ID exista.
 */
function formatNewsItem(item: ApiNewsItem): News {
  if (item.id == null || item.id.length == 0) {
    throw Error("NewsService - El objeto News no tiene un ID establecido");
  }

  return {
    id: item.id,
    title: item.title || "Sin titulo",
    description: item.description || "Sin descripcion",
    link: item.link || "Sin link",
    publicationDate: item.publicationDate || "",
    ...(item.authors && { authors: item.authors }),
  };
}

/**
 * Obtiene una página de noticias del endpoint /page.
 */
export async function fetchNewsPage(
  page: number = 0,
  size: number = 5
): Promise<NewsPage> {
  const url = new URL(`${API_BASE}/api/news/page`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());
  // El 'sort' lo añade el backend por defecto


  try {
    const res = await fetch(url.toString());
    
    if (!res.ok) {
      throw new Error(`NewService - HTTP Error ${res.status}`);
    }

    const pageData: NewsPage = (await res.json()) as NewsPage;
    
    // Se procesa el contenido de la página
    pageData.content = pageData.content.map(formatNewsItem);
    return pageData;

  } catch (error) {
    console.error(`[NewsService] Fallo al obtener ${url.toString()}:`, error);
    throw error;
  }
}

/**
 * Obtiene TODAS las noticias en una sola llamada.
 */
export async function fetchAllNews(): Promise<News[]> {
  const url = `${API_BASE}/api/news/all`;  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw Error(
        `NewsService - Error ${res.status}: No se ha podido obtener la información del backend`
      );
    }

    const rawData: ApiNewsItem[] = (await res.json()) as ApiNewsItem[];
    return rawData.map(formatNewsItem);
  } catch (error) {
    console.error("[NewsService] Fallo crítico al obtener noticias:", error);
    throw error;
  }
}

/**
 * Busca noticias y devuelve una página de resultados.
 * Ahora es consistente con fetchNewsPage.
 */
export async function searchNews(
  query: string,
  page: number = 0,
  size: number = 5
): Promise<NewsPage> {

  // Se construye la URL base del endpoint de búsqueda
  const url = new URL(`${API_BASE}/api/news/search`);

  url.searchParams.append("query", query);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());

  try {
    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`NewService - HTTP Error ${res.status}`);
    }

    const pageData: NewsPage = (await res.json()) as NewsPage;
    
    pageData.content = pageData.content.map(formatNewsItem); 
    
    return pageData;

  } catch (error) {
    console.error(`[NewsService] Fallo al buscar ${url.toString()}:`, error);
    throw error;
  }
}