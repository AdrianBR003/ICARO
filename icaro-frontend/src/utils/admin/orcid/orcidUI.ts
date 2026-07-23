// Elementos UI globales
const dom = {
    loader: () => document.getElementById('duplicateLoader'),
    status: () => document.getElementById('statusMessage'),
    previewArea: () => document.getElementById('previewArea'),
    debugJson: () => document.getElementById('debugJson'),
    btn: () => document.getElementById('searchBtn') as HTMLButtonElement
};

// --- NAVEGACIÓN ---
export function switchStep(from: number, to: number) {
    const fromArea = document.getElementById(`step-${from}-area`);
    if (fromArea) {
        fromArea.classList.add('opacity-0');
        setTimeout(() => {
            fromArea.classList.add('hidden');
            const toArea = document.getElementById(`step-${to}-area`);
            if (toArea) {
                toArea.classList.remove('hidden');
                setTimeout(() => toArea.classList.remove('opacity-0'), 50);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 300);
    }
    updateStepperUI(to);
}

function updateStepperUI(activeStep: number) {
    [1, 2, 3].forEach(step => {
        const el = document.getElementById(`step-${step}-indicator`);
        if (!el) return;
        const circle = el.querySelector('span');
        const text = el.querySelectorAll('span')[1];

        if (step === activeStep) {
            el.classList.remove('opacity-50');
            circle?.classList.remove('bg-slate-200', 'text-slate-500');
            circle?.classList.add('bg-[#1D293D]', 'text-white', 'shadow-md');
            text?.classList.remove('text-slate-500', 'font-medium');
            text?.classList.add('text-[#1D293D]', 'font-bold');
        } else {
            el.classList.add('opacity-50');
            circle?.classList.add('bg-slate-200', 'text-slate-500');
            circle?.classList.remove('bg-[#1D293D]', 'text-white', 'shadow-md');
            text?.classList.add('text-slate-500', 'font-medium');
            text?.classList.remove('text-[#1D293D]', 'font-bold');
        }
    });
}

// --- UTILIDADES VISUALES ---
export function toggleLoader(show: boolean) {
    const loader = dom.loader();
    if (loader) show ? loader.classList.remove('hidden') : loader.classList.add('hidden');
}

export function showStatus(msg: string, type: 'success' | 'error') {
    const el = dom.status();
    if (!el) return;
    el.textContent = msg;
    el.className = "mt-4 rounded-lg p-4 text-sm font-medium border";
    if (type === 'error') el.classList.add('bg-red-50', 'text-red-700', 'border-red-100');
    else el.classList.add('bg-green-50', 'text-[#006D38]', 'border-green-100');
    el.classList.remove('hidden');
}

export function hideStatus() {
    dom.status()?.classList.add('hidden');
}

export function setLoadingBtn(isLoading: boolean) {
    const btn = dom.btn();
    if (!btn) return;
    btn.disabled = isLoading;
    if (isLoading) {
        btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Buscando...`;
    } else {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> <span>Buscar</span>`;
    }
}

export function showJsonPreview(data: any) {
    const area = dom.previewArea();
    const json = dom.debugJson();
    if (area && json) {
        json.textContent = JSON.stringify(data, null, 2);
        area.classList.remove('hidden');
        setTimeout(() => area.classList.remove('opacity-0'), 50);
    }
}

export function hideJsonPreview() {
    const area = dom.previewArea();
    if (area) {
        area.classList.add('opacity-0');
        setTimeout(() => area.classList.add('hidden'), 300);
    }
}