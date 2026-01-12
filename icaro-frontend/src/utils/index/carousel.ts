import {
  fetchHighlightedNews,
  createNewsCard,
} from "@/services/index/carouselService";

import { API_URL } from "@/configAPI";
import { createImageLoader } from "@/utils/general/imageLoaderFactory"; 
import { backendStatus } from "@/stores/backendStatusStore";

const GAP = 32; 

export function setupCarousel(
  sliderId: string,
  prevBtnId: string,
  nextBtnId: string
): void {
  const slider = document.getElementById(sliderId) as HTMLElement;
  const prevBtn = document.getElementById(prevBtnId) as HTMLButtonElement;
  const nextBtn = document.getElementById(nextBtnId) as HTMLButtonElement;
  const carouselLoader = document.getElementById("carousel-loader");

  if (!slider || !prevBtn || !nextBtn) {
    console.error("No se han encontrado los elementos del carousel");
    return;
  }

  // --- Lógica de Backend Status ---
  backendStatus.subscribe(async (status) => {
    if (status === "offline") {
      console.log("Backend offline — esperando reconexión");
      if (carouselLoader) {
        carouselLoader.style.opacity = "1";
        carouselLoader.style.display = "flex";
      }
      return;
    }

    if (status === "online") {
      console.log("Backend online — recargando noticias");
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

  const getCardWidth = (): number => {
    const firstChild = slider.firstElementChild as HTMLElement;
    return firstChild ? firstChild.getBoundingClientRect().width + GAP : 0;
  };

  /**
   * Carga las noticias destacadas y activa el ImageLoader
   */
  async function loadHighlightedNews(): Promise<void> {
    const carouselLoader = document.getElementById("carousel-loader");

    try {
      const highlightedNews = await fetchHighlightedNews();

      if (highlightedNews.length === 0) {
        console.log("No hay noticias disponibles");
        return;
      }

      slider.innerHTML = highlightedNews.map(createNewsCard).join("");
      
      if (carouselLoader) {
        carouselLoader.style.opacity = "0";
        setTimeout(() => {
          carouselLoader.style.display = "none";
        }, 300);
      }

      const carouselImageLoader = createImageLoader({
        basePath: `${API_URL}/assets/news`,
        dataAttribute: "data-news-image",
      });

      carouselImageLoader.loadImages();

      try {
        carouselImageLoader.setupObserver(sliderId);
      } catch (e) {
        console.warn("No se pudo configurar el observer del carousel", e);
      }

    } catch (error) {
      console.error("Error al cargar noticias:", error);
      const retryBtn = document.getElementById("retryBtn");
      if (retryBtn) {
        retryBtn.addEventListener("click", loadHighlightedNews);
      }
    }
  }

  // --- Navegación del Slider (Sin cambios) ---
  function scrollSlide(dir: number): void {
    const cardWidth = getCardWidth();
    if (cardWidth === 0) return;

    const isAtStart = slider.scrollLeft === 0;
    const isAtEnd =
      Math.ceil(slider.scrollLeft + slider.clientWidth) >= slider.scrollWidth;

    if (dir < 0 && isAtStart) {
      slider.scrollLeft = slider.scrollWidth - slider.clientWidth;
    } else if (dir > 0 && isAtEnd) {
      slider.scrollLeft = 0;
    } else {
      slider.scrollBy({
        left: dir * cardWidth,
        behavior: "smooth",
      });
    }
  }

  prevBtn.addEventListener("click", () => scrollSlide(-1));
  nextBtn.addEventListener("click", () => scrollSlide(1));

  slider.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      scrollSlide(-1);
    } else if (e.key === "ArrowRight") {
      scrollSlide(1);
    }
  });

  // Carga inicial
  loadHighlightedNews();
}