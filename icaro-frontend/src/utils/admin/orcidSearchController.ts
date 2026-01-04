import type { OrcidPreviewDTO } from "@/types/orcid";
import { fetchOrcidPreview } from "@/services/admin/orcidService"; // <--- Importamos el servicio

// Referencias a elementos del DOM
let form: HTMLFormElement | null = null;
let input: HTMLInputElement | null = null;
let btn: HTMLButtonElement | null = null;
let statusMsg: HTMLElement | null = null;
let previewArea: HTMLElement | null = null;
let debugJson: HTMLElement | null = null;

export function initOrcidSearch() {
    form = document.getElementById('orcidSearchForm') as HTMLFormElement;
    input = document.getElementById('orcidId') as HTMLInputElement;
    btn = document.getElementById('searchBtn') as HTMLButtonElement;
    statusMsg = document.getElementById('statusMessage');
    previewArea = document.getElementById('previewArea');
    debugJson = document.getElementById('debugJson');

    if (!form || !input || !btn) return;

    form.addEventListener('submit', handleSearchSubmit);
}

async function handleSearchSubmit(e: Event) {
    e.preventDefault();
    if (!input) return;

    const orcid = input.value.trim();
    if (!orcid) return;

    // 1. Prepara UI
    setLoading(true);
    hideStatus();
    hidePreview();

    try {
        // 2. Llama al Servicio (Aquí está la magia de la separación)
        const data = await fetchOrcidPreview(orcid);

        // 3. Actualiza UI con Éxito
        showStatus("Datos recuperados correctamente de ORCID.", "success");
        showPreview(data);

    } catch (error) {
        // 4. Maneja Errores de UI
        console.error(error);
        const msg = error instanceof Error ? error.message : "Error desconocido";
        showStatus(msg, "error");
        
        // Si el error es de sesión, podríamos redirigir al login opcionalmente
        if (msg.includes("Sesión")) {
            setTimeout(() => window.location.href = '/login', 2000);
        }
    } finally {
        setLoading(false);
    }
}

// --- UI HELPERS (Sin cambios respecto al anterior, solo gestionan HTML) ---

function setLoading(isLoading: boolean) {
    if (!btn) return;
    btn.disabled = isLoading;
    if (isLoading) {
        btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Buscando...`;
    } else {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> <span>Buscar Datos</span>`;
    }
}

function showStatus(msg: string, type: 'success' | 'error') {
    if (!statusMsg) return;
    statusMsg.textContent = msg;
    statusMsg.className = "mt-4 rounded-lg p-4 text-sm font-medium border transition-all duration-300"; 

    if (type === 'error') {
        statusMsg.classList.add('bg-red-50', 'text-red-700', 'border-red-100');
    } else {
        statusMsg.classList.add('bg-green-50', 'text-[#006D38]', 'border-green-100');
    }
    statusMsg.classList.remove('hidden');
}

function hideStatus() {
    if (statusMsg) statusMsg.classList.add('hidden');
}

function showPreview(data: OrcidPreviewDTO) {
    if (!previewArea || !debugJson) return;
    debugJson.textContent = JSON.stringify(data, null, 2);
    previewArea.classList.remove('hidden');
    setTimeout(() => previewArea.classList.remove('opacity-0'), 50);
}

function hidePreview() {
    if (previewArea) {
        previewArea.classList.add('opacity-0');
        setTimeout(() => previewArea.classList.add('hidden'), 300);
    }
}