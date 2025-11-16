import type{News, NewsImageResponse} from '@/types/news'; 

const API_URL = 'http://localhost:8080/api/news/Hnews'; 
const GAP = 32; // Espacio entre las tarjetas

// Declaramos las funciones básicas 

function setupCarousel(
    sliderId: string,
    prevBtnId: string, 
    nextBtnId: string
){
    // Se utiliza el 'as' como si fuera un indexOf de Java
    const slider = document.getElementById(sliderId) as HTMLElement; 
    const prevBtn = document.getElementById(prevBtnId) as HTMLButtonElement; 
    const nextBtn = document.getElementById(nextBtnId) as HTMLButtonElement; 

    // Verificación de los datos
    if(!slider || !prevBtn || !nextBtn){
        console.log('No se han encontrado los elementos del carousel del index'); 
        return; 
    }

    // -- Lógica del Carousel -- 

    const getCardWidth = (): number => {
    const firstChild = slider.firstElementChild as HTMLElement;
    return firstChild ? firstChild.getBoundingClientRect().width + GAP : 0;
  };

  // ✨ Tipamos el parámetro "news"
  function createNewsCard(news: News): string {
    // La misma función que ya tenías, ahora con la seguridad de tipos
    return `
      <article class="shrink-0 snap-center flex w-full max-w-[200rem] rounded-xl ring-1 ring-gray-200 border-r-4 border-[#006D38]">
        <div class="basis-4/12 relative">
          <img
            src="http://localhost:8080/assets/news/default.png"
            alt="${news.title || 'Noticia destacada'}"
            data-news-image="${news.id || ''}"
            class="absolute inset-0 w-full h-full object-contain p-3 transition-opacity duration-300"
            loading="lazy"
            onerror="this.src='http://localhost:8080/assets/news/default.png'"
          />
        </div>
        <div class="basis-8/12 p-8 flex flex-col justify-between bg-[#EAF4EA]">
          <div>
            <h3 class="text-2xl font-semibold text-[#231F20]">${news.title || 'Sin título'}</h3>
            ${news.authors && news.authors !== 'Autor no especificado' && news.authors.trim() !== '' ? 
              `<p class="text-lg text-gray-500 line-clamp-1">${news.authors}</p>` : 
              ''
            }
            <p class="text-base text-gray-600 mt-3 line-clamp-3">${news.description || 'Sin descripción disponible'}</p>
          </div>
          ${news.link ? `
            <a
              href="${news.link}"
              class="mt-4 text-lg underline text-[#006D38] hover:text-[#004d29]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver publicación →
            </a>
          ` : ''}
        </div>
      </article>
    `;
  }

  // ✨ Tipamos los parámetros de la función
  async function loadNewsImage(imgElement: HTMLImageElement, newsId: string): Promise<void> {
    if (!newsId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/news/check-image/${newsId}`);
      if (response.ok) {
        // ✨ Le decimos a TS qué esperar de la respuesta JSON
        const data: NewsImageResponse = await response.json();
        if (data.exists && data.imageURL) {
          const fullImageUrl = data.imageURL.startsWith('http') 
            ? data.imageURL 
            : `http://localhost:8080${data.imageURL}`;
          imgElement.src = fullImageUrl;
        }
      }
    } catch (error) {
      console.error(`Error al cargar imagen para noticia ${newsId}:`, error);
    }
  }

  function loadAllImages(): void {
    const imageElements = slider.querySelectorAll<HTMLImageElement>('img[data-news-image]');
    imageElements.forEach(img => {
      const newsId = img.getAttribute('data-news-image');
      if (newsId) {
        loadNewsImage(img, newsId);
      }
    });
  }

  async function loadHighlightedNews(): Promise<void> {
    slider.innerHTML = `<div class="w-full text-center p-8"><p class="text-gray-500">Cargando noticias destacadas...</p></div>`;
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const highlightedNews: News[] = await response.json();
      
      if (!highlightedNews || highlightedNews.length === 0) {
        slider.innerHTML = `<div class="w-full text-center p-8"><p class="text-gray-500">No hay noticias destacadas.</p></div>`;
        return;
      }

      slider.innerHTML = highlightedNews.map(createNewsCard).join('');
      loadAllImages();

    } catch (error) {
      console.error('Error al cargar noticias destacadas:', error);
      slider.innerHTML = `
        <div class="w-full text-center p-8">
          <p class="text-red-500">Error al cargar las noticias.</p>
          <button id="retryBtn" class="mt-2 px-4 py-2 bg-[#006D38] text-white rounded hover:bg-[#005229]">Reintentar</button>
        </div>`;
      document.getElementById('retryBtn')?.addEventListener('click', loadHighlightedNews);
    }
  }

  function scrollSlide(dir: number): void {
    const cardWidth = getCardWidth();
    if (cardWidth === 0) return;

    if (dir < 0 && slider.scrollLeft === 0) {
      slider.scrollLeft = slider.scrollWidth - slider.clientWidth;
    } else if (dir > 0 && Math.ceil(slider.scrollLeft + slider.clientWidth) >= slider.scrollWidth) {
      slider.scrollLeft = 0;
    } else {
      slider.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
    }
  }

  prevBtn.addEventListener('click', () => scrollSlide(-1));
  nextBtn.addEventListener('click', () => scrollSlide(1));

  // Carga inicial
  loadHighlightedNews();
}

// ✨ Exportamos la función principal para que el componente Astro la pueda llamar
export { setupCarousel };

