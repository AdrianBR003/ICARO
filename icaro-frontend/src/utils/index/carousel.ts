export function initCarouselScroll(
  sliderId: string,
  prevBtnId: string,
  nextBtnId: string
): void {
  const slider = document.getElementById(sliderId) as HTMLElement;
  const prevBtn = document.getElementById(prevBtnId) as HTMLButtonElement;
  const nextBtn = document.getElementById(nextBtnId) as HTMLButtonElement;
  
  if (!slider || !prevBtn || !nextBtn) return;

  function scrollSlide(dir: number): void {
    // AHORA ES MÁS FÁCIL:
    // El ancho a desplazar es exactamente el ancho visible del slider
    const scrollAmount = slider.clientWidth; 

    const isAtStart = slider.scrollLeft === 0;
    // Tolerancia de 5px para errores de redondeo en pantallas retina
    const isAtEnd = Math.ceil(slider.scrollLeft + slider.clientWidth) >= slider.scrollWidth - 5;

    if (dir < 0 && isAtStart) {
      // Ir al final (Loop)
      slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
    } else if (dir > 0 && isAtEnd) {
      // Ir al principio (Loop)
      slider.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      // Desplazamiento normal
      slider.scrollBy({
        left: dir * scrollAmount,
        behavior: 'smooth',
      });
    }
  }

  prevBtn.addEventListener("click", () => scrollSlide(-1));
  nextBtn.addEventListener("click", () => scrollSlide(1));
}