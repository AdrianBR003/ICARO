import { fetchNewsPage, searchNews } from "@/services/news/newsService";
import type { News, NewsPage } from "@/types/news";

export interface NewsPageData {
  news: News[];
  totalPages: number;
  currentPage: number;
}

/**
 * Carga los datos de la página de noticias.
 * Actúa como un controlador:
 * - Si hay un parámetro 'query', llama a searchNews.
 * - Si no, llama a fetchNewsPage.
 */
export async function loadNewsPages(astroUrl: URL): Promise<NewsPageData> {
  // --- 1. Leer los parámetros de la URL ---

  // Se obtiene el parámetro de búsqueda
  const query = astroUrl.searchParams.get("query");
  
  // Se obtiene el parámetro de página
  const pageParam = astroUrl.searchParams.get("page");
  
  // --- 2. Calcular las páginas ---
  // La página que ve el usuario (base 1, default 1)
  const userPage = pageParam ? parseInt(pageParam) : 1; 
  // La página que se pide a Spring Boot (base 0)
  const springBootPage = Math.max(0, userPage - 1); 

  try {
    let newsPageData: NewsPage; // Se declara una variable para guardar la respuesta

    if (query && query.trim() !== "") {
      // --- Caso Búsqueda ---
      newsPageData = await searchNews(query, springBootPage, 5);
    } else {
      // --- Caso Paginación Normal ---
      newsPageData = await fetchNewsPage(springBootPage, 5);
    }

    return {
      news: newsPageData.content,
      totalPages: newsPageData.totalPages,
      currentPage: userPage, 
    };

  } catch (error) {
    console.error(
      "[newsPageLoader] Error al cargar la página de noticias:",
      error
    );
    return {
      news: [],
      totalPages: 0,
      currentPage: 1,
    };
  }
}