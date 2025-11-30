import type { ResearchPageDTO } from "@/types/research";

const API_BASE_URL = "http://localhost:8080";

/**
 * Obtiene trabajos de investigación paginados y filtrados.
 * GET /api/work/paged?page=0&size=5&query=...
 */
export async function fetchResearchPaged(
  page: number,
  size: number,
  query: string = ""
): Promise<ResearchPageDTO> {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());
    
    if (query.trim() !== "") {
      params.append("query", query);
    }

    const response = await fetch(`${API_BASE_URL}/api/works/paged?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching research works:", error);
    
    // Return empty structure on error to prevent UI crash
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: size,
      last: true,
      first: true,
      empty: true
    };
  }
}