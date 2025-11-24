import { fetchAllProjects, fetchRelatedWorksByProject } from "@/services/project/projectsService";
import type { Project, RelatedWork } from "@/types/project";

export async function loadProjectsData(): Promise<Project[]> {
  const rawProjects = await fetchAllProjects();

  const projectsWithWorks = await Promise.all(
    rawProjects.map(async (project) => {
      const rawWorks = await fetchRelatedWorksByProject(project.id);

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
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        colaborators: project.participants || [],
        firstProjectDate: project.firstProjectDate || " ... ",
        secondProjectDate: project.secondProjectDate || " ... ",
        relatedWorks: formattedWorks,
      };
    })
  );

  return projectsWithWorks;
}