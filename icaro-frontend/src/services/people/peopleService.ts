import type { PeoplePageDTO } from "@/types/people";
import { API_BASE } from "@/configAPI";

/**
 * Obtiene investigadores paginados y filtrados por nombre/apellido.
 * Endpoint: GET /api/investigators/paged?page=0&size=8&query=...
 */
export async function fetchPeoplePaged(
  page: number,
  size: number,
  query: string = ""
): Promise<PeoplePageDTO> {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString()); 

    if (query.trim() !== "") {
      params.append("query", query);
    }

    const response = await fetch(`${API_BASE}/investigators/paged?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching people:", error);
    
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