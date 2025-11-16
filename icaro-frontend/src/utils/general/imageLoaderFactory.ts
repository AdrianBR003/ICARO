
interface LoaderConfig{
    basePath: string; 
    dataAttribute: string; 
}

export function createImageLoader(config: LoaderConfig){
    const imageCache = new Map<string, string | null>();
    const { basePath, dataAttribute } = config; 

    function loadSingleImage(assetId: string, imgElement: HTMLImageElement){
        const extensions = ["webp", "jpg", "jpeg", "png"];
        let currentIndex = 0; 

        function tryNextExtension(){
            if(currentIndex >= extensions.length){
                imageCache.set(assetId, null); // No se encontró ninguna
                return; 
            }
            const ext = extensions[currentIndex]; 
            // Construccion de la URL 
            const imageUrl = `${basePath}/${assetId}.${ext}`;
            const testImg = new Image(); 

            testImg.onload = function(){
                imgElement.src = imageUrl; 
                imgElement.dataset.imageLoaded = "true"; 
                imageCache.set(assetId, imageUrl); 
            }

            testImg.onerror = function (){
                currentIndex++; 
                tryNextExtension();
            };
            testImg.src = imageUrl; 
        }
        tryNextExtension();
    }

    function loadImages(){
        const selector = `img[${dataAttribute}]`; 
        const images = document.querySelectorAll<HTMLImageElement>(selector); 

        images.forEach((img) => {
        const assetId = img.getAttribute(dataAttribute); 
        if(!assetId) return; 
        if (img.dataset.imageLoaded === "true") return; 
        
        if(imageCache.has(assetId)){
            const cachedUrl = imageCache.get(assetId); 
            if(cachedUrl){
                img.src = cachedUrl; 
                img.dataset.imageLoaded = "true"; 
            }
            true; 
        }
        loadSingleImage(assetId, img); 
        }); 
    }

    function setupObserver(targetElementId: string){
        const targetElement = document.getElementById(targetElementId); 
        if(!targetElement){
            throw Error(`imageFactory - No se encontró el observador con id: ${targetElement}`); 
        }
        const observer = new MutationObserver((mutations) => {
            for(const mutation of mutations){
                if(mutation.type === "childList" && mutation.addedNodes.length > 0){
                    setTimeout(() => loadImages(), 100); 
                    break; 
                }
            }
        });
        observer.observe(targetElement, {childList: true, subtree: true}); 
    }
    return{
        loadImages, 
        setupObserver,
    }; 
}