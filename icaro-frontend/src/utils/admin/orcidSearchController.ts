import type { OrcidPreviewDTO, AnalyzedWork } from "@/types/orcid";
import { fetchOrcidPreview, checkOrcidDuplicates, importOrcidProfile } from "@/services/admin/orcidService";

// --- REFERENCIAS AL DOM ---

// Paso 1: Búsqueda
let form: HTMLFormElement | null = null;
let input: HTMLInputElement | null = null;
let btn: HTMLButtonElement | null = null;
let statusMsg: HTMLElement | null = null;
let previewArea: HTMLElement | null = null;
let debugJson: HTMLElement | null = null;
let continueBtn: HTMLButtonElement | null = null;

// Paso 2: Formulario de Revisión
let reviewName: HTMLInputElement | null = null;
let reviewLastName: HTMLInputElement | null = null;
let reviewRole: HTMLInputElement | null = null;
let reviewOffice: HTMLInputElement | null = null;
let reviewEmail: HTMLInputElement | null = null;
let reviewPhone: HTMLInputElement | null = null;
let reviewBio: HTMLTextAreaElement | null = null;
let reviewOrcidId: HTMLInputElement | null = null;
let worksCountLabel: HTMLElement | null = null;
let importWorksCheck: HTMLInputElement | null = null;
let backBtn: HTMLButtonElement | null = null;
let toSummaryBtn: HTMLButtonElement | null = null;

// Paso 3: Resumen y Confirmación
let previewCardName: HTMLElement | null = null;
let previewCardRole: HTMLElement | null = null;
let previewCardEmail: HTMLElement | null = null;
let previewCardPhone: HTMLElement | null = null;
let previewCardOffice: HTMLElement | null = null;

let previewCardEmailContainer: HTMLElement | null = null;
let previewCardPhoneContainer: HTMLElement | null = null;
let previewCardOfficeContainer: HTMLElement | null = null;

let previewWorksTableBody: HTMLElement | null = null;
let previewTotalWorks: HTMLElement | null = null;
let backToReviewBtn: HTMLButtonElement | null = null;
let finalImportBtn: HTMLButtonElement | null = null;

// Elementos Globales y Navegación
let duplicateLoader: HTMLElement | null = null;
let step1Area: HTMLElement | null = null;
let step2Area: HTMLElement | null = null;
let step3Area: HTMLElement | null = null;
let step1Indicator: HTMLElement | null = null;
let step2Indicator: HTMLElement | null = null;
let step3Indicator: HTMLElement | null = null;

// Estado de la Aplicación
let currentFetchedData: OrcidPreviewDTO | null = null;
let currentFormData: any = {};

/**
 * Inicialización principal
 */
export function initOrcidSearch() {
    assignDomElements();
    attachListeners();
}

function assignDomElements() {
    // Paso 1
    form = document.getElementById('orcidSearchForm') as HTMLFormElement;
    input = document.getElementById('orcidId') as HTMLInputElement;
    btn = document.getElementById('searchBtn') as HTMLButtonElement;
    statusMsg = document.getElementById('statusMessage');
    previewArea = document.getElementById('previewArea');
    debugJson = document.getElementById('debugJson');
    continueBtn = document.getElementById('continueBtn') as HTMLButtonElement;

    // Paso 2
    reviewName = document.getElementById('reviewName') as HTMLInputElement;
    reviewLastName = document.getElementById('reviewLastName') as HTMLInputElement;
    reviewRole = document.getElementById('reviewRole') as HTMLInputElement;
    reviewOffice = document.getElementById('reviewOffice') as HTMLInputElement;
    reviewEmail = document.getElementById('reviewEmail') as HTMLInputElement;
    reviewPhone = document.getElementById('reviewPhone') as HTMLInputElement;
    reviewBio = document.getElementById('reviewBio') as HTMLTextAreaElement;
    reviewOrcidId = document.getElementById('reviewOrcidId') as HTMLInputElement;
    worksCountLabel = document.getElementById('worksCountLabel');
    importWorksCheck = document.getElementById('importWorksCheck') as HTMLInputElement;
    backBtn = document.getElementById('backBtn') as HTMLButtonElement;
    toSummaryBtn = document.getElementById('saveInvestigatorBtn') as HTMLButtonElement;

    // Paso 3
    previewCardName = document.getElementById('previewCardName');
    previewCardRole = document.getElementById('previewCardRole');
    previewCardEmail = document.getElementById('previewCardEmail');
    previewCardPhone = document.getElementById('previewCardPhone');
    previewCardOffice = document.getElementById('previewCardOffice');

    previewCardEmailContainer = document.getElementById('previewCardEmailContainer');
    previewCardPhoneContainer = document.getElementById('previewCardPhoneContainer');
    previewCardOfficeContainer = document.getElementById('previewCardOfficeContainer');

    previewWorksTableBody = document.getElementById('previewWorksTableBody');
    previewTotalWorks = document.getElementById('previewTotalWorks');
    backToReviewBtn = document.getElementById('backToReviewBtn') as HTMLButtonElement;
    finalImportBtn = document.getElementById('finalImportBtn') as HTMLButtonElement;

    // Loader y Áreas
    duplicateLoader = document.getElementById('duplicateLoader');
    step1Area = document.getElementById('step-1-area');
    step2Area = document.getElementById('step-2-area');
    step3Area = document.getElementById('step-3-area');
    step1Indicator = document.getElementById('step-1-indicator');
    step2Indicator = document.getElementById('step-2-indicator');
    step3Indicator = document.getElementById('step-3-indicator');
}

function attachListeners() {
    if (form) form.addEventListener('submit', handleSearchSubmit);
    if (continueBtn) continueBtn.addEventListener('click', handleContinueToReview);
    if (backBtn) backBtn.addEventListener('click', () => switchStep(2, 1));
    if (toSummaryBtn) toSummaryBtn.addEventListener('click', handleReviewToSummary);
    if (backToReviewBtn) backToReviewBtn.addEventListener('click', () => switchStep(3, 2));
    if (finalImportBtn) finalImportBtn.addEventListener('click', handleFinalImport);
}

// --- LOGICA PASO 1: BÚSQUEDA ---

async function handleSearchSubmit(e: Event) {
    e.preventDefault();
    if (!input) return;
    const orcid = input.value.trim();
    if (!orcid) return;

    setLoading(true);
    hideStatus();
    hidePreview();
    currentFetchedData = null;

    try {
        const data = await fetchOrcidPreview(orcid);
        currentFetchedData = data;
        showStatus("Datos recuperados correctamente.", "success");
        showPreview(data);
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        showStatus(msg, "error");
        if (msg.includes("Sesión")) setTimeout(() => window.location.href = '/login', 2000);
    } finally {
        setLoading(false);
    }
}

function handleContinueToReview() {
    if (!currentFetchedData) return;
    populateReviewForm(currentFetchedData);
    switchStep(1, 2);
}

// --- LOGICA PASO 2: REVISIÓN ---

function populateReviewForm(data: OrcidPreviewDTO) {
    if (reviewName) reviewName.value = data.firstName || "";
    if (reviewLastName) reviewLastName.value = data.lastName || "";
    if (reviewEmail) reviewEmail.value = data.email || "";
    if (reviewRole) reviewRole.value = "";
    if (reviewOffice) reviewOffice.value = "";
    if (reviewPhone) reviewPhone.value = "";
    if (reviewBio) reviewBio.value = data.biography || "";
    if (reviewOrcidId) reviewOrcidId.value = data.orcidId || "";
    if (worksCountLabel) {
        const count = data.works ? data.works.length : 0;
        worksCountLabel.textContent = `Se han encontrado ${count} investigaciones.`;
    }
}

/**
 * Transición clave: Valida formulario, llama al backend para chequear duplicados
 * y prepara los datos para el resumen.
 */
async function handleReviewToSummary() {
    // 1. Validar campos obligatorios
    if (!reviewName?.value || !reviewLastName?.value) {
        alert("El nombre y los apellidos son obligatorios.");
        return;
    }

    // 2. Mostrar Loader de Análisis
    if (duplicateLoader) duplicateLoader.classList.remove('hidden');

    try {
        // 3. Preparar lista de obras para verificar
        let worksToCheck = [];
        if (importWorksCheck?.checked && currentFetchedData?.works) {
            worksToCheck = currentFetchedData.works;
        }

        // 4. Llamada al Backend (Check Duplicates)
        // Si no hay obras seleccionadas, devolvemos array vacío directamente
        const analyzedWorks = worksToCheck.length > 0
            ? await checkOrcidDuplicates(reviewOrcidId?.value || "", worksToCheck)
            : [];

        // 5. Construir objeto de datos consolidado
        currentFormData = {
            orcidId: reviewOrcidId?.value,
            firstName: reviewName.value,
            lastName: reviewLastName.value,
            role: reviewRole?.value || null,
            office: reviewOffice?.value || null,
            email: reviewEmail?.value || null,
            phone: reviewPhone?.value || null,
            biography: reviewBio?.value || null,
            importWorks: importWorksCheck?.checked || false,
            works: analyzedWorks // Lista enriquecida con flags de duplicados
        };

        // 6. Renderizar Paso 3
        renderSummary(currentFormData);

        // 7. Avanzar paso
        switchStep(2, 3);

    } catch (error) {
        console.error("Error analizando duplicados:", error);
        alert("Ocurrió un error al verificar duplicados con el servidor.");
    } finally {
        // 8. Ocultar Loader
        if (duplicateLoader) duplicateLoader.classList.add('hidden');
    }
}

// --- LOGICA PASO 3: RESUMEN ---

function renderSummary(data: any) {
    // A. Renderizar Tarjeta PeopleCard
    if (previewCardName) previewCardName.textContent = `${data.firstName} ${data.lastName}`;
    if (previewCardRole) previewCardRole.textContent = data.role || "";

    if (previewCardEmail) previewCardEmail.textContent = data.email || "";
    toggleContainer(previewCardEmailContainer, !!data.email);

    if (previewCardPhone) previewCardPhone.textContent = data.phone || "";
    toggleContainer(previewCardPhoneContainer, !!data.phone);

    if (previewCardOffice) previewCardOffice.textContent = data.office || "";
    toggleContainer(previewCardOfficeContainer, !!data.office);

    // B. Renderizar Tabla de Works Inteligente
    if (previewWorksTableBody) {
        previewWorksTableBody.innerHTML = "";

        // Caso: Sin obras
        if (!data.importWorks || !data.works || data.works.length === 0) {
            previewWorksTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-slate-400 italic">No hay investigaciones seleccionadas para importar.</td></tr>`;
            if (previewTotalWorks) previewTotalWorks.textContent = "0 trabajos";
            return;
        }

        let selectedCount = 0;

        // Loop de obras analizadas
        data.works.forEach((work: AnalyzedWork, index: number) => {
            const tr = document.createElement('tr');
            
            // Lógica por defecto: Si es duplicado -> NO chequeado. Si es nuevo -> Chequeado.
            const isDup = work.isDuplicate;
            const isChecked = !isDup;
            
            // Inicializamos propiedad 'selected' para el envío final
            work.selected = isChecked;
            if (isChecked) selectedCount++;

            // Estilos: Rojo suave para duplicados, Blanco para nuevos
            tr.className = isDup
                ? "bg-red-50/60 border-b border-red-100 hover:bg-red-50 transition-colors"
                : "bg-white border-b hover:bg-slate-50 transition-colors";

            // Renderizado de celdas
            tr.innerHTML = `
                <td class="px-4 py-4 text-center">
                    <input 
                        type="checkbox" 
                        class="work-selector w-4 h-4 rounded border-gray-300 text-[#006D38] focus:ring-[#006D38] cursor-pointer"
                        data-index="${index}"
                        ${isChecked ? 'checked' : ''}
                    >
                </td>
                <td class="px-6 py-4 font-mono text-xs text-slate-500">
                    ${work.putCode || "N/A"}
                </td>
                <td class="px-6 py-4 font-mono text-xs text-slate-500">
                    ${work.year || "-"}
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium text-[#1D293D] line-clamp-2" title="${work.title}">${work.title}</div>
                </td>
                <td class="px-6 py-4">
                    ${isDup
                        ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200" title="${work.duplicateReason}">
                             Duplicado
                           </span>`
                        : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                             Nuevo
                           </span>`
                    }
                </td>
            `;
            previewWorksTableBody?.appendChild(tr);
        });

        // Actualizar contador inicial
        if (previewTotalWorks) {
            previewTotalWorks.textContent = `${data.works.length} encontrados (${selectedCount} seleccionados)`;
        }

        // Listeners para checkboxes individuales (Recalcular contador)
        attachCheckboxListeners(data.works);
    }
}

function attachCheckboxListeners(works: any[]) {
    const checkboxes = document.querySelectorAll('.work-selector');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const index = parseInt(target.getAttribute('data-index') || "0");

            // Actualizar estado en el objeto de datos
            if (works[index]) {
                works[index].selected = target.checked;
            }

            // Recalcular contador visual
            const checkedCount = document.querySelectorAll('.work-selector:checked').length;
            if (previewTotalWorks) {
                previewTotalWorks.textContent = `${works.length} encontrados (${checkedCount} seleccionados)`;
            }
        });
    });
}

// --- LOGICA FINAL: GUARDAR ---
async function handleFinalImport() {
    if (!currentFormData) return;

    // 1. Filtrar obras seleccionadas
    // Solo enviamos al backend las que el usuario ha dejado marcadas (selected === true)
    const selectedWorks = currentFormData.works.filter((w: any) => w.selected === true);

    // 2. Preparar Payload final
    const finalPayload = {
        orcidId: currentFormData.orcidId,
        firstName: currentFormData.firstName,
        lastName: currentFormData.lastName,
        role: currentFormData.role,
        office: currentFormData.office,
        email: currentFormData.email,
        phone: currentFormData.phone,
        biography: currentFormData.biography,
        works: selectedWorks.map((w: any) => ({
            title: w.title,
            year: w.year,
            type: w.type,
            putCode: w.putCode
        }))
    };

    console.log("Enviando al Backend:", finalPayload);

    if (finalImportBtn) {
        const originalText = finalImportBtn.innerHTML;
        finalImportBtn.disabled = true;
        finalImportBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Guardando...
        `;

        try {
            // 3. LLAMADA REAL AL BACKEND
            await importOrcidProfile(finalPayload);
            
            // 4. ÉXITO
            alert("¡Importación completada con éxito!");
            
            // Redirigir a la lista de investigadores o al dashboard
            window.location.href = "/admin/people"; 

        } catch (error) {
            console.error("Error importando:", error);
            alert("Hubo un error al guardar los datos. Revisa la consola.");
            
            // Restaurar botón
            finalImportBtn.innerHTML = originalText;
            finalImportBtn.disabled = false;
        }
    }
}

// --- UI HELPERS & NAVIGATION ---

function switchStep(from: number, to: number) {
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

function toggleContainer(el: HTMLElement | null, show: boolean) {
    if (!el) return;
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
}

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
    statusMsg.className = "mt-4 rounded-lg p-4 text-sm font-medium border";
    if (type === 'error') statusMsg.classList.add('bg-red-50', 'text-red-700', 'border-red-100');
    else statusMsg.classList.add('bg-green-50', 'text-[#006D38]', 'border-green-100');
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