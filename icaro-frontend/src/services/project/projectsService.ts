import type { ProjectPageDTO, RelatedWorkDTO } from "@/types/project";
import type { ProjectSelector } from "@/types/project";
import { API_BASE } from "@/configAPI";

export async function fetchAllProjectsList(): Promise<[]> {
  try {
    const response = await fetch(`${API_BASE}/project/selector`);
    
    if (!response.ok) {
      throw new Error("Error fetching project list for selector");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error cargando lista de proyectos:", error);
    return [];
  }
}

/**
 * Obtiene proyectos paginados y filtrados (por título) desde el backend.
 * @param page Número de página (0-indexado en Backend, pero el loader gestionará eso)
 * @param size Cantidad de elementos por página
 * @param query Texto de búsqueda (opcional)
 */
export async function fetchProjectsPaged(
  page: number,
  size: number,
  query: string = ""
): Promise<ProjectPageDTO> {
  try {
    // Ejemplo resultante: ?page=0&size=5&query=redes
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());
    
    if (query.trim() !== "") {
      params.append("query", query);
    }

    const response = await fetch(`${API_BASE}/project/paged?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    //console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: size,
      last: true,
      first: true,
      numberOfElements: 0,
      empty: true
    };
  }
}

/**
 * Obtiene los trabajos relacionados de un proyecto específico.
 */
export async function fetchRelatedWorksByProject(projectId: string): Promise<RelatedWorkDTO[]> {
  try {
    const response = await fetch(
      `${API_BASE}/project-work/project/${projectId}/works`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching works for project ${projectId}:`, error);
    return [];
  }
}