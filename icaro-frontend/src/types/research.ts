export interface ResearchWorkDTO {
  id: string;
  orcidOwner: string;        // ID del investigador principal
  title: string;
  description: string;
  participants: string[];    // Nombres de los participantes
  externalIds: string[];     // Links externos (DOI, URL, etc.)
  ownerOrcids: string[];     // ORCIDs de los participantes
  projectDate: string;       // Formato "yyyy-MM-dd" que viene de LocalDate
  projectId: string;         // ID del Proyecto padre (Relación 1:N actual) TODO: Cambiar en el futuro a N:N
  tags: string[];            // Etiquetas o tipo de publicación
}

// Respuesta de Paginación de SpringBoot
export interface ResearchPageDTO {
  content: ResearchWorkDTO[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Estructura simplificada para el Loader/UI
export interface ResearchPageData {
  works: ResearchWorkDTO[];
  totalPages: number;
  currentPage: number;
}