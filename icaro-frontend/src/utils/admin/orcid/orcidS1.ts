import { fetchOrcidPreview } from "@/services/admin/orcidService";
import { orcidState } from "./orcidState";
import { hideJsonPreview, hideStatus, setLoadingBtn, showJsonPreview, showStatus, switchStep } from "./orcidUI";
import { populateReviewForm } from "./orcidS2"; 

export function initStep1() {
    const form = document.getElementById('orcidSearchForm');
    const continueBtn = document.getElementById('continueBtn');

    if (form) form.addEventListener('submit', handleSearch);
    if (continueBtn) continueBtn.addEventListener('click', handleContinue);
}

async function handleSearch(e: Event) {
    e.preventDefault();
    const input = document.getElementById('orcidId') as HTMLInputElement;
    const orcid = input?.value.trim();
    if (!orcid) return;

    setLoadingBtn(true);
    hideStatus();
    hideJsonPreview();
    orcidState.fetchedData = null;

    try {
        const data = await fetchOrcidPreview(orcid);
        orcidState.fetchedData = data;
        showStatus("Datos recuperados correctamente.", "success");
        showJsonPreview(data);
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        showStatus(msg, "error");
        if (msg.includes("Sesión")) setTimeout(() => window.location.href = '/login', 2000);
    } finally {
        setLoadingBtn(false);
    }
}

function handleContinue() {
    if (!orcidState.fetchedData) return;
    populateReviewForm(orcidState.fetchedData);
    switchStep(1, 2);
}