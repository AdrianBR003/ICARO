import type { ProjectDTO, RelatedWorkDTO } from "@/types/project";

const API_BASE_URL = "http://localhost:8080";

export async function fetchAllProjects(): Promise<ProjectDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/project/all`);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();    
    return data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function fetchRelatedWorksByProject(
  projectId: number
): Promise<RelatedWorkDTO[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/project-work/project/${projectId}/works`
    );
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching works for project ${projectId}:`, error);
    return [];
  }
}
