import { fetchResearchPaged, fetchUniqueTags } from "@/services/research/researchService";
import { fetchAllProjectsList } from "@/services/project/projectsService";
import type { ResearchWorkDTO } from "@/types/research";

export interface ResearchLoaderResult {
  works: ResearchWorkDTO[];
  totalPages: number;
  currentPage: number;
  allProjects: { id: string; title: string }[];
  allTags: string[];
  activeFilters: { project: string; tag: string; query: string };
}

export async function loadResearchPage(url: URL): Promise<ResearchLoaderResult> {
  // 1. Leer parámetros URL
  const query = url.searchParams.get("query") || "";
  const projectFilter = url.searchParams.get("project") || "";
  const tagFilter = url.searchParams.get("tag") || "";
  const pageParam = Number(url.searchParams.get("page")) || 1;
  const apiPage = Math.max(0, pageParam - 1);
  const pageSize = 5;

  const [pagedData, projectsList, tagsList] = await Promise.all([
    fetchResearchPaged(apiPage, pageSize, query, projectFilter, tagFilter),
    fetchAllProjectsList(), 
    fetchUniqueTags()
  ]);

  // 3. Enriquecer Works (Mapear ID Proyecto -> Nombre Proyecto)
  // Creamos un mapa para búsqueda rápida O(1)
  const projectMap = new Map(projectsList.map(p => [String(p.id), p.title]));

  const enrichedWorks = pagedData.content.map(work => ({
    ...work,
    participants: work.participants || [],
    tags: work.tags || [],
    externalIds: work.externalIds || [],
    projectTitle: work.projectId ? projectMap.get(String(work.projectId)) : undefined
  }));

  return {
    works: enrichedWorks,
    totalPages: pagedData.totalPages,
    currentPage: pagedData.number + 1,
    allProjects: projectsList,
    allTags: tagsList,
    activeFilters: { project: projectFilter, tag: tagFilter, query }
  };
}