import { fetchNewsPage, searchNews } from "@/services/news/newsService";
import type { News, NewsPage } from "@/types/news";

export interface NewsPageData {
  news: News[];
  totalPages: number;
  currentPage: number;
}

export async function loadNewsPages(astroUrl: URL): Promise<NewsPageData> {
  const query = astroUrl.searchParams.get("query");
  const pageParam = astroUrl.searchParams.get("page");
  // Aseguramos que sea mínimo 1
  const userPage = pageParam ? Math.max(1, parseInt(pageParam)) : 1; 
  // Spring Boot usa paginación base-0
  const springBootPage = userPage - 1; 

  let newsPageData: NewsPage; 

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
}