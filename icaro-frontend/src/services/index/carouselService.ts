// carouselService.ts
import type { News, NewsImageResponse } from "@/types/news";
import { 
  loadWithLoader, 
  subscribeToBackendStatus 
} from "@/services/general/loaderService";

const API_URL = "http://localhost:8080/api/news/Hnews";
const IMAGE_CHECK_URL = "http://localhost:8080/api/news/check-image";
const DEFAULT_IMAGE = "http://localhost:8080/assets/news/default.png";

export async function fetchHighlightedNews(): Promise<News[]> {
  console.log('🌐 [CAROUSEL] Fetching desde:', API_URL);
  const response = await fetch(API_URL);
  
  console.log('📥 [CAROUSEL] Response status:', response.status);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const news: News[] = await response.json();
  console.log('📦 [CAROUSEL] Noticias recibidas:', news);
  console.log('📊 [CAROUSEL] Cantidad:', news?.length || 0);
  
  return news || [];
}

export async function checkNewsImage(
  newsId: string
): Promise<NewsImageResponse | null> {
  if (!newsId) return null;
  try {
    const response = await fetch(`${IMAGE_CHECK_URL}/${newsId}`);
    if (!response.ok) return null;
    const data: NewsImageResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error al verificar imagen para noticia ${newsId}:`, error);
    return null;
  }
}

export async function loadNewsImage(
  imgElement: HTMLImageElement,
  newsId: string
): Promise<void> {
  const imageData = await checkNewsImage(newsId);
  if (imageData?.exists && imageData.imageURL) {
    const fullImageUrl = imageData.imageURL.startsWith("http")
      ? imageData.imageURL
      : `http://localhost:8080${imageData.imageURL}`;
    imgElement.src = fullImageUrl;
  } else {
    imgElement.src = DEFAULT_IMAGE;
  }
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
    <article class="shrink-0 snap-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-row w-full">
      <div class="flex-shrink-0 w-80 bg-white overflow-hidden flex items-center justify-center p-6">
        <img
          src="${DEFAULT_IMAGE}"
          alt="Imagen de la noticia: ${news.title || "Noticia destacada"}"
          data-news-image="${news.id || ""}"
          class="w-full h-full object-contain transition-opacity duration-300"
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

export async function mountCarousel(ids: { 
    containerId: string; 
    loaderId: string; 
    prevBtnId: string; 
    nextBtnId: string;
}) {
  const container = document.getElementById(ids.containerId);
  const prevBtn = document.getElementById(ids.prevBtnId);
  const nextBtn = document.getElementById(ids.nextBtnId);

  if (!container) {
    console.error('❌ [CAROUSEL] Contenedor no encontrado');
    return;
  }

  console.log('✅ [CAROUSEL] Montando carousel...');

  let isLoading = false;

  function renderNews(news: News[]): void {
    console.log('🎨 [CAROUSEL] Renderizando', news.length, 'noticias');
    container.innerHTML = news.map(createNewsCard).join('');

    const images = container.querySelectorAll('img[data-news-image]');
    images.forEach((img) => {
      const imgEl = img as HTMLImageElement;
      if (imgEl.dataset.newsImage) {
        loadNewsImage(imgEl, imgEl.dataset.newsImage);
      }
    });
  }

  function clearCarousel(): void {
    console.log('🧹 [CAROUSEL] Limpiando contenido (Protegiendo loader)');
    const children = Array.from(container.children);
    children.forEach(child => {
      if (child.id !== ids.loaderId) {
        child.remove();
      }
    });
  }

  async function loadCarouselData(): Promise<void> {
    if (isLoading) {
      console.log('⏸️ [CAROUSEL] Ya hay una carga en progreso');
      return;
    }
    
    isLoading = true;
    console.log('🚀 [CAROUSEL] Iniciando carga...');

    try {
      await loadWithLoader(
        ids.loaderId,
        fetchHighlightedNews,
        {
          onSuccess: renderNews,
          onEmpty: clearCarousel,
          // Función explícita para verificar si el array está vacío
          checkEmpty: (data: News[]) => {
            const isEmpty = !data || data.length === 0;
            console.log(`🔍 [CAROUSEL] checkEmpty: ${isEmpty} (length: ${data?.length})`);
            return isEmpty;
          },
          messages: {
            loading: 'Cargando noticias destacadas...',
            error: 'Error en el servidor',
            empty: 'No hay noticias disponibles'
          }
        }
      );
    } finally {
      isLoading = false;
      console.log('✔️ [CAROUSEL] Carga finalizada');
    }
  }

  // Configurar navegación
  const scrollAmount = 600;
  prevBtn?.addEventListener('click', () => {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  nextBtn?.addEventListener('click', () => {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Carga inicial
  await loadCarouselData();

  // Suscripción reactiva al backend
  subscribeToBackendStatus(ids.loaderId, loadCarouselData, {
    error: 'Error en el servidor'
  });
}
