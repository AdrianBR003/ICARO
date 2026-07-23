import { initStep1 } from "./orcidS1";
import { initStep2 } from "./orcidS2";
import { initStep3 } from "./orcidS3";

export function initOrcidFlow() {
    console.log("Inicializando flujo modular ORCID...");
    initStep1();
    initStep2();
    initStep3();
}