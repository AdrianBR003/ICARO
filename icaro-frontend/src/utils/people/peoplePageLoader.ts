import { fetchPeoplePaged } from "@/services/people/peopleService";
import type { PeoplePageData } from "@/types/people";

export async function loadPeoplePage(url: URL): Promise<PeoplePageData> {
  // 1. Obtener parámetros de la URL
  const query = url.searchParams.get("query") || "";
  
  // Frontend usa página 1-based, Backend usa 0-based
  const pageParam = Number(url.searchParams.get("page")) || 1;
  const apiPage = Math.max(0, pageParam - 1); 
  
  const pageSize = 8; 

  // 2. Llamada al Servicio
  const pagedData = await fetchPeoplePaged(apiPage, pageSize, query);

  // 3. Transformación / Limpieza de datos
  // Aseguramos que no haya nulos que rompan la UI
  const cleanPeople = pagedData.content.map(person => ({
    ...person,
    // Si algún campo opcional viene null, lo pasamos a string vacío
    role: person.role || "",
    biography: person.biography || "",
    email: person.email || "",
    office: person.office || "",
    phone: person.phone || ""
  }));

  // 4. Retorno estructurado para la UI
  return {
    people: cleanPeople,
    totalPages: pagedData.totalPages,
    currentPage: pagedData.number + 1 // Convertimos a 1-based para la UI
  };
}