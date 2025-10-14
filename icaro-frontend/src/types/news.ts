export interface News{
    id: string; 
    title: string; 
    description: string; 
    authors?: string; 
    link?: string; 
}

// index/Carrousel
export interface NewsImageResponse{
    exists: boolean; 
    imageURL?: string; 
}