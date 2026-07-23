export interface News {
  id: string;
  title: string;
  description: string;
  authors?: string;
  link?: string;
  publicationDate?: string;
  highlighted: boolean; 
  createdAt?: string;
  imageName?: string; 
}

// index/Carrousel
export interface NewsImageResponse {
  exists: boolean;
  imageURL?: string;
}

// Page

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export type NewsPage = Page<News>;
