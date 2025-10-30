import { fetchNewsPage } from "@/services/newsService";
import type { News, NewsPage } from "@/types/news";

export interface NewsPageData {
  news: News[];
  totalPages: number;
  currentPage: number;
}

export async function loadNewsPages(astroUrl: URL): Promise<NewsPageData> {
  const pageParam = astroUrl.searchParams.get("page");
  
  const userPage = pageParam ? parseInt(pageParam) : 1;
  const springBootPage = Math.max(0, userPage - 1); // Backend usa base 0

  console.log(`[Loader] URL page param: ${pageParam}`);
  console.log(`[Loader] User page (display): ${userPage}`);
  console.log(`[Loader] Spring Boot page (API): ${springBootPage}`);

  try {
    const newsPageData = await fetchNewsPage(springBootPage, 5);
    
    console.log(`[Loader] Received ${newsPageData.content.length} news items`);
    console.log(`[Loader] Total pages from API: ${newsPageData.totalPages}`);
    
    return {
      news: newsPageData.content,
      totalPages: newsPageData.totalPages,
      currentPage: userPage, // Devolvemos la página para el usuario (base 1)
    };
  } catch (error) {
    console.error(
      "[newsPageLoader] Error al cargar la página de noticias:",
      error
    );
    return {
      news: [],
      totalPages: 1,
      currentPage: 1,
    };
  }
}