import { fetchResearchPaged } from "@/services/research/researchService";
import type { ResearchPageData } from "@/types/research";

export async function loadResearchPage(url: URL): Promise<ResearchPageData> {
  // 1. Obtener parámetros de la URL
  const query = url.searchParams.get("query") || "";
  
  // Frontend usa página 1-based, Backend usa 0-based
  const pageParam = Number(url.searchParams.get("page")) || 1;
  const apiPage = Math.max(0, pageParam - 1); 
  const pageSize = 5; // Configurable

  // 2. Llamada al Servicio
  const pagedData = await fetchResearchPaged(apiPage, pageSize, query);

  // 3. Transformación / Limpieza de datos (si fuera necesaria)
  // Aquí devolvemos los datos tal cual vienen del DTO, asegurando arrays vacíos
  const cleanWorks = pagedData.content.map(work => ({
    ...work,
    participants: work.participants || [],
    tags: work.tags || [],
    externalIds: work.externalIds || [],
    ownerOrcids: work.ownerOrcids || []
  }));

  // 4. Retorno estructurado para la UI
  return {
    works: cleanWorks,
    totalPages: pagedData.totalPages,
    currentPage: pagedData.number + 1 // Convertimos a 1-based para la UI
  };
}