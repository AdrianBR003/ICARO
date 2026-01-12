import { API_BASE } from "@/configAPI";

export async function createResearchService(researchData: any): Promise<Response> {
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

    return response;
  } catch (error) {
    console.error("Error en createResearchService:", error);
    throw new Error("Error de conexión al servidor");
  }
}