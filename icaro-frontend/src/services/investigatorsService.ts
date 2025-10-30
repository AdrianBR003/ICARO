import type { Investigator } from "@/types/investigator";

export const getAllInvestigators = async (): Promise<Investigator[]> =>{
    try{
        const res = await fetch("http://localhost:8080/api/investigators/all");
        if(!res.ok){
            throw new Error(`Error HTTP: ${res.status}`);
        }

        // Desconocemos lo que es 'res.json()' por lo que usamos 'any' por ahora: 
        const rawInvestigators: any[] = await res.json(); 

        // Mapeamos los datos a nuestra interfaz
        const investigators : Investigator[] = rawInvestigators.map((inv) => ({
            name: inv.givenNames || "",
            email: inv.email || "",
            role: inv.role || "",
            phone: inv.phone || "",
            office: inv.office || "",
            img: `/assets/${inv.orcid}.jpg`,
            orcid: inv.orcid,            
        }))

        return investigators; 

    } catch(error){
        console.error("No se pudo obtener la lista de investigadores", error); 
        return []; 
    }
}