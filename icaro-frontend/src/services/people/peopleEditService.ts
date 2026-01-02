const API_BASE_URL = "http://localhost:8080";

export async function updatePersonService(personData: any): Promise<Response> {
  const token = localStorage.getItem("adminToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Extraemos el ORCID para la URL
  const orcid = personData.orcid;

  try {
    const response = await fetch(`${API_BASE_URL}/api/investigators/save/${encodeURIComponent(orcid)}`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(personData),
    });

    return response;
  } catch (error) {
    console.error("Error en updatePersonService:", error);
    throw new Error("Error de conexión al servidor");
  }
}