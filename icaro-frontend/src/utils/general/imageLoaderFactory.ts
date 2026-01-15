
interface LoaderConfig {
    basePath: string;
    dataAttribute: string;
    defaultUrl: string;
}

export function createImageLoader(config: LoaderConfig) {
    const imageCache = new Map<string, string | null>();
    // Desestructuramos el nuevo parámetro
    const { basePath, dataAttribute, defaultUrl } = config;

    function loadSingleImage(assetId: string, imgElement: HTMLImageElement) {
        // Orden de prioridad: WebP primero (más ligero), luego formatos tradicionales
        const extensions = ["webp", "jpg", "jpeg", "png"];
        let currentIndex = 0;

        function tryNextExtension() {
            // Si ya probamos todas y no hay éxito
            if (currentIndex >= extensions.length) {
                imageCache.set(assetId, null); // Guardamos que no existe
                
                // FALLBACK: Aseguramos que se vea la imagen por defecto
                if (imgElement.src !== defaultUrl) {
                    imgElement.src = defaultUrl;
                }
                return;
            }

            const ext = extensions[currentIndex];
            const imageUrl = `${basePath}/${assetId}.${ext}`;
            const testImg = new Image();

            testImg.onload = function () {
                // ¡Éxito! La imagen existe
                imgElement.src = imageUrl;
                imgElement.dataset.imageLoaded = "true";
                imgElement.classList.remove("opacity-0"); // Opcional: para efecto fade-in
                imageCache.set(assetId, imageUrl);
            };

            testImg.onerror = function () {
                // Falló esta extensión, probamos la siguiente
                currentIndex++;
                tryNextExtension();
            };

            testImg.src = imageUrl;
        }

        tryNextExtension();
    }

    function loadImages() {
        const selector = `img[${dataAttribute}]`;
        const images = document.querySelectorAll<HTMLImageElement>(selector);

        images.forEach((img) => {
            const assetId = img.getAttribute(dataAttribute);
            if (!assetId) return;
            if (img.dataset.imageLoaded === "true") return;

            // Revisar caché primero
            if (imageCache.has(assetId)) {
                const cachedUrl = imageCache.get(assetId);
                if (cachedUrl) {
                    img.src = cachedUrl;
                    img.dataset.imageLoaded = "true";
                } else {
                    // Si en caché dice null, ponemos default
                    img.src = defaultUrl;
                }
                return;
            }

            loadSingleImage(assetId, img);
        });
    }

    // El setupObserver se queda igual
    function setupObserver(targetElementId: string) {
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement) {
            // Cambiado a console.warn para no romper la app si falta el ID
            console.warn(`imageFactory - No se encontró el contenedor: ${targetElementId}`);
            return;
        }
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                    setTimeout(() => loadImages(), 100);
                    break;
                }
            }
        });
        observer.observe(targetElement, { childList: true, subtree: true });
    }

    return {
        loadImages,
        setupObserver,
    };
}