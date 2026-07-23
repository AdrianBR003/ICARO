import type { News } from "@/types/news";
import { API_BASE, API_URL } from "@/configAPI";
const DEFAULT_IMAGE = `${API_URL}/assets/news/default.png`;

export async function fetchHighlightedNews(): Promise<News[]> {
  const response = await fetch(`${API_BASE}/news/Hnews`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const news: News[] = await response.json();
  return news || [];
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}
export function createNewsCard(news: News): string {
  const truncatedDescription = truncateText(
    news.description || "Sin descripción disponible",
    200
  );

  const publicationDate = news.publicationDate?.toString() || "Sin fecha";

  return `
    <article class="shrink-0 snap-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-row w-full h-full">
      
      <div class="flex-shrink-0 w-80 h-64 sm:h-72 bg-white p-4 flex items-center justify-center">
        <img
          src="${DEFAULT_IMAGE}" 
          alt="Imagen de la noticia: ${news.title || "Noticia destacada"}"
          data-news-image="${news.id}" 
          class="w-full h-full object-cover rounded-lg shadow-sm transition-opacity duration-300"
          loading="lazy"
          onerror="this.src='${DEFAULT_IMAGE}'"
        />
      </div>

      <div class="p-8 flex-1 flex flex-col min-w-0 bg-white">
        <h3 class="text-2xl font-bold mb-4 text-gray-900 leading-tight">
          ${news.title || "Sin título"}
        </h3>
        <div class="mb-4 flex items-center text-sm text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#006D38] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span class="font-medium text-gray-800">Fecha de publicación:</span>
          <span class="ml-1 text-gray-600">${publicationDate}</span>
        </div>
        <div class="mb-6 flex-1">
          <p class="text-gray-600 leading-relaxed break-words">
            ${truncatedDescription}
          </p>
        </div>
        ${
          news.link
            ? `
        <div class="mt-auto flex justify-end">
          <a href="${news.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-5 py-3 bg-[#006D38] hover:bg-[#005229] text-white font-semibold text-sm rounded-lg shadow-md transition-all duration-200">
            Ver más
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        `
            : ""
        }
      </div>
    </article>
  `;
}