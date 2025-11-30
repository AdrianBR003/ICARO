import { fetchProjectsPaged, fetchRelatedWorksByProject } from "@/services/project/projectsService";
import type { Project, RelatedWork, ProjectsPageData } from "@/types/project";

export async function loadProjectsPages(url: URL): Promise<ProjectsPageData> {
  const query = url.searchParams.get("query") || "";
  
  // Frontend usa página 1-based, Backend usa 0-based
  const pageParam = Number(url.searchParams.get("page")) || 1;
  const apiPage = Math.max(0, pageParam - 1); 
  const pageSize = 5; 

  const pagedData = await fetchProjectsPaged(apiPage, pageSize, query);

  const projectsWithWorks = await Promise.all(
    pagedData.content.map(async (projectDTO) => { 
        
      const rawWorks = await fetchRelatedWorksByProject(projectDTO.id.toString());

      // Mapeo de Related Works
      const formattedWorks: RelatedWork[] = rawWorks.map((work) => ({
        type: work.tags && work.tags.length > 0 ? work.tags[0] : "Publicación",
        title: work.title,
        year: work.projectDate
          ? new Date(work.projectDate).getFullYear().toString()
          : "N/A",
        link: work.externalIds && work.externalIds.length > 0
          ? work.externalIds[0]
          : null,
      }));

      // Retornar objeto Project final
      return {
        id: projectDTO.id,
        title: projectDTO.title,
        description: projectDTO.description,
        colaborators: projectDTO.participants || [],
        firstProjectDate: projectDTO.firstProjectDate || " ... ",
        secondProjectDate: projectDTO.secondProjectDate || " ... ",
        relatedWorks: formattedWorks,
      };
    })
  );

  return {
    projects: projectsWithWorks,
    totalPages: pagedData.totalPages,
    currentPage: pagedData.number + 1 // Convertimos de vuelta a 1-based para la UI
  };
}