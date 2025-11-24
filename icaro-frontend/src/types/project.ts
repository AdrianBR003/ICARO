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