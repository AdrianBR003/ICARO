import { API_BASE } from "@/configAPI";

export async function updateResearchService(researchData: any): Promise<Response> {
  const token = localStorage.getItem("adminToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}/works/save`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(researchData),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error HTTP ${response.status} en /api/works/save:`, errorBody);
      throw new Error(`Error ${response.status}: ${errorBody}`);
    }

    // Retorna la respuesta para que el frontend verifique `response.ok`
    return response;
  } catch (error) {
    console.error("Error en updateResearchService:", error);
    throw error;
  }
}