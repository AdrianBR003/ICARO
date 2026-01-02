export interface InvestigatorDTO {
  orcid: string;      
  givenNames: string;
  familyName: string;
  email: string;
  role: string;       
  phone: string;
  office: string;
  biography: string;
}

// Respuesta de Paginación de SpringBoot
export interface PeoplePageDTO {
  content: InvestigatorDTO[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Datos procesados para la UI (Loader)
export interface PeoplePageData {
  people: InvestigatorDTO[];
  totalPages: number;
  currentPage: number;
}