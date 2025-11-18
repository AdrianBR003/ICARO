// carousel.ts
import {
  fetchHighlightedNews,
  loadNewsImage,
  createNewsCard,
} from "@/services/index/carouselService";

const GAP = 32; // Espacio entre las tarjetas

/**
 * Configura el carousel de noticias destacadas
 */
export function setupCarousel(
  sliderId: string,
  prevBtnId: string,
  nextBtnId: string
): void {
  const slider = document.getElementById(sliderId) as HTMLElement;
  const prevBtn = document.getElementById(prevBtnId) as HTMLButtonElement;
  const nextBtn = document.getElementById(nextBtnId) as HTMLButtonElement;

  // Verificación de los elementos
  if (!slider || !prevBtn || !nextBtn) {
    console.error("No se han encontrado los elementos del carousel");
    return;
  }

  // Obtiene el ancho de una tarjeta incluyendo el gap
  const getCardWidth = (): number => {
    const firstChild = slider.firstElementChild as HTMLElement;
    return firstChild ? firstChild.getBoundingClientRect().width + GAP : 0;
  };

  /**
   * Carga todas las imágenes de las noticias en el slider
   */
  function loadAllImages(): void {
    const imageElements = slider.querySelectorAll<HTMLImageElement>(
      "img[data-news-image]"
    );
    imageElements.forEach((img) => {
      const newsId = img.getAttribute("data-news-image");
      if (newsId) {
        loadNewsImage(img, newsId);
      }
    });
  }

  /**
   * Carga las noticias destacadas desde el backend
   */
  async function loadHighlightedNews(): Promise<void> {
    const carouselLoader = document.getElementById("carousel-loader");

    try {
      const highlightedNews = await fetchHighlightedNews();

      if (highlightedNews.length === 0) {
        slider.innerHTML = `
  <div class="w-full h-[30vh] flex items-center justify-center">
    <div class="bg-white border border-gray-300 rounded-xl shadow-xl p-12 text-center max-w-xl">
      <p class="text-gray-700 text-xl font-semibold tracking-wide">
        No hay noticias destacadas disponibles.
      </p>
    </div>
  </div>
`;


        // Oculta el loader
        if (carouselLoader) carouselLoader.style.display = "none";
        return;
      }

      // Renderiza las tarjetas de noticias
      slider.innerHTML = highlightedNews.map(createNewsCard).join("");

      // Oculta el loader con animación
      if (carouselLoader) {
        carouselLoader.style.opacity = "0";
        setTimeout(() => {
          carouselLoader.style.display = "none";
        }, 300);
      }

      // Carga las imágenes después de renderizar
      loadAllImages();
    } catch (error) {
      console.error("Error al cargar noticias:", error);
      slider.innerHTML = `
      <div class="w-full text-center p-8">
        <p class="text-red-500 mb-4">Error al cargar las noticias.</p>
        <button 
          id="retryBtn" 
          class="px-6 py-2 bg-[#006D38] text-white rounded-lg hover:bg-[#005229] transition-colors"
        >
          Reintentar
        </button>
      </div>
    `;

      // Oculta el loader incluso en error
      if (carouselLoader) carouselLoader.style.display = "none";

      const retryBtn = document.getElementById("retryBtn");
      if (retryBtn) {
        retryBtn.addEventListener("click", loadHighlightedNews);
      }
    }
  }
  /**
   * Desplaza el carousel en la dirección especificada
   * @param dir -1 para anterior, 1 para siguiente
   */
  function scrollSlide(dir: number): void {
    const cardWidth = getCardWidth();
    if (cardWidth === 0) return;

    const isAtStart = slider.scrollLeft === 0;
    const isAtEnd =
      Math.ceil(slider.scrollLeft + slider.clientWidth) >= slider.scrollWidth;

    // Implementa scroll circular
    if (dir < 0 && isAtStart) {
      // Si estamos al inicio y vamos hacia atrás, vamos al final
      slider.scrollLeft = slider.scrollWidth - slider.clientWidth;
    } else if (dir > 0 && isAtEnd) {
      // Si estamos al final y vamos hacia adelante, volvemos al inicio
      slider.scrollLeft = 0;
    } else {
      // Scroll normal
      slider.scrollBy({
        left: dir * cardWidth,
        behavior: "smooth",
      });
    }
  }

  // Event listeners para los botones
  prevBtn.addEventListener("click", () => scrollSlide(-1));
  nextBtn.addEventListener("click", () => scrollSlide(1));

  // Soporte para teclado
  slider.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      scrollSlide(-1);
    } else if (e.key === "ArrowRight") {
      scrollSlide(1);
    }
  });

  // Carga inicial de noticias
  loadHighlightedNews();
}
