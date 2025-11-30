const API_BASE_URL = "http://localhost:8080";

export async function updateResearchService(researchData: any): Promise<Response> {
  const token = localStorage.getItem("adminToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/works/save`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(researchData),
    });

    return response;
  } catch (error) {
    console.error("Error en updateResearchService:", error);
    throw new Error("Error de conexión al servidor");
  }
}