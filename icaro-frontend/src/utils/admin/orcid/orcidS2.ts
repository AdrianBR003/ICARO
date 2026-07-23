import type { OrcidPreviewDTO } from "@/types/orcid";
import { checkOrcidDuplicates } from "@/services/admin/orcidService";
import { orcidState } from "./orcidState";
import { switchStep, toggleLoader } from "./orcidUI";
import { renderSummary } from "./orcidS3"; 

const els = {
    name: () => document.getElementById('reviewName') as HTMLInputElement,
    lastName: () => document.getElementById('reviewLastName') as HTMLInputElement,
    role: () => document.getElementById('reviewRole') as HTMLInputElement,
    office: () => document.getElementById('reviewOffice') as HTMLInputElement,
    email: () => document.getElementById('reviewEmail') as HTMLInputElement,
    phone: () => document.getElementById('reviewPhone') as HTMLInputElement,
    bio: () => document.getElementById('reviewBio') as HTMLTextAreaElement,
    orcidId: () => document.getElementById('reviewOrcidId') as HTMLInputElement,
    worksCount: () => document.getElementById('worksCountLabel'),
    importCheck: () => document.getElementById('importWorksCheck') as HTMLInputElement,
    backBtn: () => document.getElementById('backBtn'),
    saveBtn: () => document.getElementById('saveInvestigatorBtn')
};

export function initStep2() {
    if (els.backBtn()) els.backBtn()!.addEventListener('click', () => switchStep(2, 1));
    if (els.saveBtn()) els.saveBtn()!.addEventListener('click', handleReviewToSummary);
}

export function populateReviewForm(data: OrcidPreviewDTO) {
    if (els.name()) els.name().value = data.firstName || "";
    if (els.lastName()) els.lastName().value = data.lastName || "";
    if (els.email()) els.email().value = data.email || "";
    if (els.role()) els.role().value = "";
    if (els.office()) els.office().value = "";
    if (els.phone()) els.phone().value = "";
    if (els.bio()) els.bio().value = data.biography || "";
    if (els.orcidId()) els.orcidId().value = data.orcidId || "";
    if (els.worksCount()) {
        const count = data.works ? data.works.length : 0;
        els.worksCount()!.textContent = `Se han encontrado ${count} investigaciones.`;
    }
}

async function handleReviewToSummary() {
    if (!els.name()?.value || !els.lastName()?.value) {
        alert("El nombre y los apellidos son obligatorios.");
        return;
    }

    toggleLoader(true);

    try {
        let worksToCheck = [];
        if (els.importCheck()?.checked && orcidState.fetchedData?.works) {
            worksToCheck = orcidState.fetchedData.works;
        }

        const analyzedWorks = worksToCheck.length > 0
            ? await checkOrcidDuplicates(els.orcidId()?.value || "", worksToCheck)
            : [];

        orcidState.formData = {
            orcidId: els.orcidId()?.value,
            firstName: els.name().value,
            lastName: els.lastName().value,
            role: els.role()?.value || null,
            office: els.office()?.value || null,
            email: els.email()?.value || null,
            phone: els.phone()?.value || null,
            biography: els.bio()?.value || null,
            importWorks: els.importCheck()?.checked || false,
            works: analyzedWorks // Works con flags isDuplicate
        };

        renderSummary(orcidState.formData);
        switchStep(2, 3);

    } catch (error) {
        console.error("Error analizando duplicados:", error);
        alert("Ocurrió un error al verificar duplicados con el servidor.");
    } finally {
        toggleLoader(false);
    }
}