const ASSETS_BASE_URL = "http://localhost:8080/assets/people";
const DEFAULT_IMG = `${ASSETS_BASE_URL}/default.jpg`;

export function initPersonImageLoader() {
  const images = document.querySelectorAll("img[data-orcid-image]") as NodeListOf<HTMLImageElement>;

  images.forEach((img) => {
    const orcid = img.getAttribute("data-orcid");
    if (!orcid) return;

    if (!img.src.includes("default.jpg") && img.complete && img.naturalHeight !== 0) {
        return;
    }

    const extensions = ["jpg", "png", "webp"];
    let currentIndex = 0;

    function tryNextExtension() {
      if (currentIndex >= extensions.length) {
        // Fallaron todas, dejamos la default
        return;
      }

      const ext = extensions[currentIndex];
      const imageUrl = `${ASSETS_BASE_URL}/${orcid}.${ext}`;
      
      const testImg = new Image();
      
      testImg.onload = function () {
        // Si carga con éxito, reemplazamos la fuente
        img.src = imageUrl;
      };
      
      testImg.onerror = function () {
        // Si falla, probamos la siguiente
        currentIndex++;
        tryNextExtension();
      };
      
      testImg.src = imageUrl;
    }

    tryNextExtension();
  });
}