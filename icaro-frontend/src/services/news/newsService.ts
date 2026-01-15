import { backendStatus } from "@/stores/backendStatusStore";
import type { News, NewsPage } from "@/types/news";
import { hideLoader, updateLoaderState } from "../general/loaderService";
import { API_BASE } from "@/configAPI";

interface ApiNewsItem {
  id?: string;
  title?: string;
  description?: string;
  link?: string;
  publicationDate?: string;
  authors?: string;
  imageName?: string; 
}

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
    imageName: item.imageName || null,
  };
}

/**
 * Obtiene una página de noticias del endpoint /page.
 */
export async function fetchNewsPage(
  page: number = 0,
  size: number = 5
): Promise<NewsPage> {
  const url = new URL(`${API_BASE}/news/page`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());

  if (import.meta.env.SSR) {
      console.log(`🚀 [SSR-DEBUG] Petición interna a: ${url.toString()}`);
  }

  try {
    // CAMBIO: Añadimos headers explícitos
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json' // Importante para que Spring sepa qué devolver
      }
    });
    
    if (!res.ok) {
        // Logueamos el texto de error que devuelve Spring (a veces explica el 400)
        const errorText = await res.text(); 
        console.error(`❌ [SSR-ERROR] Status: ${res.status} - Body: ${errorText}`);
        throw new Error(`NewService - HTTP Error ${res.status}`);
    }

    // Ojo: Si ya leímos el body con res.text() arriba para el error, 
    // no podemos hacer res.json() abajo directamente sin clonar.
    // Como el error lanza throw, aquí abajo el body sigue intacto si entra al OK.
    const pageData: NewsPage = (await res.json()) as NewsPage;
    
    // ... resto del código ...
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
  const url = `${API_BASE}/news/all`;  
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
 */
export async function searchNews(
  query: string,
  page: number = 0,
  size: number = 5
): Promise<NewsPage> {

  const url = new URL(`${API_BASE}/news/search`);

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

export function initNewsListLifecycle(loaderId: string) {
  console.log(`🔌 [NewsService] Inicializando observador para: ${loaderId}`);

  const currentStatus = backendStatus.get();
  if (currentStatus === 'offline') {
    updateLoaderState(loaderId, 'error', 'Sin conexión con el servidor');
  } else {
    hideLoader(loaderId);
  }

  const unsubscribe = backendStatus.subscribe((status) => {
    console.log(`📡 [NewsService] Cambio de estado backend: ${status}`);
    
    if (status === 'offline') {
      updateLoaderState(loaderId, 'error', 'Conexión perdida con el servidor');
    } 
    else if (status === 'online') {
      hideLoader(loaderId);
    }
  });

  return unsubscribe;
}

