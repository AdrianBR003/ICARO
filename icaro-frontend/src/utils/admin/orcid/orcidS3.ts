import { importOrcidProfile } from "@/services/admin/orcidService";
import { orcidState } from "./orcidState";
import { switchStep } from "./orcidUI";
import type { AnalyzedWork } from "@/types/orcid";

const els = {
    name: () => document.getElementById('previewCardName'),
    role: () => document.getElementById('previewCardRole'),
    email: () => document.getElementById('previewCardEmail'),
    phone: () => document.getElementById('previewCardPhone'),
    office: () => document.getElementById('previewCardOffice'),
    emailCont: () => document.getElementById('previewCardEmailContainer'),
    phoneCont: () => document.getElementById('previewCardPhoneContainer'),
    officeCont: () => document.getElementById('previewCardOfficeContainer'),
    tableBody: () => document.getElementById('previewWorksTableBody'),
    totalLabel: () => document.getElementById('previewTotalWorks'),
    backBtn: () => document.getElementById('backToReviewBtn'),
    finalBtn: () => document.getElementById('finalImportBtn')
};

export function initStep3() {
    if (els.backBtn()) els.backBtn()!.addEventListener('click', () => switchStep(3, 2));
    if (els.finalBtn()) els.finalBtn()!.addEventListener('click', handleFinalImport);
}

export function renderSummary(data: any) {
    // Render PeopleCard
    if (els.name()) els.name()!.textContent = `${data.firstName} ${data.lastName}`;
    if (els.role()) els.role()!.textContent = data.role || "";
    
    updateField(els.email(), els.emailCont(), data.email);
    updateField(els.phone(), els.phoneCont(), data.phone);
    updateField(els.office(), els.officeCont(), data.office);

    // Render Table
    renderTable(data);
}

function updateField(textEl: HTMLElement | null, contEl: HTMLElement | null, val: string | null) {
    if (textEl) textEl.textContent = val || "";
    if (contEl) val ? contEl.classList.remove('hidden') : contEl.classList.add('hidden');
}

function renderTable(data: any) {
    const tbody = els.tableBody();
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!data.importWorks || !data.works || data.works.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-slate-400 italic">No hay investigaciones seleccionadas.</td></tr>`;
        if (els.totalLabel()) els.totalLabel()!.textContent = "0 trabajos";
        return;
    }

    let selectedCount = 0;

    data.works.forEach((work: AnalyzedWork, index: number) => {
        const tr = document.createElement('tr');
        const isDup = work.isDuplicate;
        const isChecked = !isDup;
        work.selected = isChecked; // Init state
        if (isChecked) selectedCount++;

        tr.className = isDup
            ? "bg-red-50/60 border-b border-red-100 hover:bg-red-50 transition-colors"
            : "bg-white border-b hover:bg-slate-50 transition-colors";

        tr.innerHTML = `
            <td class="px-4 py-4 text-center">
                <input type="checkbox" class="work-selector w-4 h-4 rounded border-gray-300 text-[#006D38] focus:ring-[#006D38] cursor-pointer"
                    data-index="${index}" ${isChecked ? 'checked' : ''}>
            </td>
            <td class="px-6 py-4 font-mono text-xs text-slate-500">${work.putCode || "N/A"}</td>
            <td class="px-6 py-4 font-mono text-xs text-slate-500">${work.year || "-"}</td>
            <td class="px-6 py-4"><div class="font-medium text-[#1D293D] line-clamp-2" title="${work.title}">${work.title}</div></td>
            <td class="px-6 py-4">
                ${isDup 
                    ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200" title="${work.duplicateReason}">Duplicado</span>`
                    : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Nuevo</span>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });

    updateCount(data.works.length, selectedCount);
    attachListeners(data.works);
}

function attachListeners(works: any[]) {
    document.querySelectorAll('.work-selector').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const index = parseInt(target.getAttribute('data-index') || "0");
            if (works[index]) works[index].selected = target.checked;
            
            const checked = document.querySelectorAll('.work-selector:checked').length;
            updateCount(works.length, checked);
        });
    });
}

function updateCount(total: number, selected: number) {
    if (els.totalLabel()) els.totalLabel()!.textContent = `${total} encontrados (${selected} seleccionados)`;
}

async function handleFinalImport() {
    const btn = els.finalBtn() as HTMLButtonElement;
    if (!orcidState.formData || !btn) return;

    const selectedWorks = orcidState.formData.works.filter((w: any) => w.selected === true);
    
    // Construir Payload Final
    const finalPayload = {
        ...orcidState.formData,
        works: selectedWorks.map((w: any) => ({
            title: w.title,
            year: w.year,
            type: w.type,
            putCode: w.putCode
        }))
    };

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Guardando...`;

    try {
        await importOrcidProfile(finalPayload);
        alert("¡Importación completada con éxito!");
        window.location.href = "/admin/people";
    } catch (error) {
        console.error(error);
        alert("Hubo un error al guardar los datos.");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}