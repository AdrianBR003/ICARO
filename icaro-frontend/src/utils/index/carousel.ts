// carousel.ts
import {
  fetchHighlightedNews,
  loadNewsImage,
  createNewsCard,
} from "@/services/index/carouselService";

import { backendStatus } from "@/stores/backendStatusStore";

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
  const carouselLoader = document.getElementById("carousel-loader");

  // Verificación de los elementos
  if (!slider || !prevBtn || !nextBtn) {
    console.error("No se han encontrado los elementos del carousel");
    return;
  }

  // Función para chequear la disponibilidad del backend

  backendStatus.subscribe(async (status) => {
    if (status === "offline") {
      console.log("Backend offline — esperando reconexión");

      // Mostrar loader
      if (carouselLoader) {
        carouselLoader.style.opacity = "1";
        carouselLoader.style.display = "flex";
      }

      return;
    }

    if (status === "online") {
      console.log("Backend online — recargando noticias");

      // Mostrar loader mientras se cargan
      if (carouselLoader) {
        carouselLoader.style.opacity = "1";
        carouselLoader.style.display = "flex";
      }

      try {
        await loadHighlightedNews();
      } catch (e) {
        console.error("Error cargando noticias tras reconexión", e);
      }
    }
  });

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
        // El loader se qeuda cargando
        console.log("No hay noticias disponibles");
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
