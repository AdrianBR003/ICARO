import type { News, NewsPage } from "@/types/news";

interface ApiNewsItem {
  id?: string;
  title?: string;
  description?: string;
  link?: string;
  publicationDate?: string;
  authors?: string;
}

const API_BASE = "http://localhost:8080";

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
export async function fetchNewsPage(
  page: number = 0,
  size: number = 5
): Promise<NewsPage> {
  
  const url = new URL(`${API_BASE}/api/news/page`);

  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());

  console.log(`[NewsService] Fetching: ${url.toString()}`);

  try {
    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`NewService - HTTP Error ${res.status}`);
    }

    const pageData: NewsPage = (await res.json()) as NewsPage;
    pageData.content = pageData.content.map(formatNewsItem);
    return pageData;
    
  } catch (error) {
    console.error(`[NewsService] Fallo al obtener ${url.toString()}:`, error);
    throw error;
  }
}

export async function fetchAllNews(): Promise<News[]> {
  const url = `${API_BASE}/api/news/all`;
  console.log(`[NewsService] Fetching (all): ${url}`);
  
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

// Buscar un item cuando no esté en el 'page' seleccionado
export async function searchNews(
  query: string,
  page: number = 0,
  size: number = 5
): Promise<NewsPage> {
  const url = `${API_BASE}/news/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error searching news: ${response.status}`);
  }
  
  return response.json();
}