export interface RelatedWorkDTO {
  tags: string[];
  title: string;
  projectDate: string | null;
  externalIds: string[];
}

export interface ProjectDTO {
  id: number;
  title: string;
  description: string;
  participants: string[];
  firstProjectDate: string;
  secondProjectDate: string;
}

export interface RelatedWork {
  type: string;
  title: string;
  year: string;
  link: string | null;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  colaborators: string[];
  firstProjectDate: string; 
  secondProjectDate: string;
  relatedWorks: RelatedWork[];
}

export interface ProjectPageDTO {
  content: ProjectDTO[];    
  totalPages: number;       
  totalElements: number;   
  last: boolean;
  size: number;
  number: number;          
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Estructura simplificada para el componente Astro
export interface ProjectsPageData {
  projects: Project[];      
  totalPages: number;
  currentPage: number;
}