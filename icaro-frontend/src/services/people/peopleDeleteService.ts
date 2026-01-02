const API_BASE_URL = "http://localhost:8080";

export async function deletePersonService(orcid: string): Promise<Response> {
  const token = localStorage.getItem("adminToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    // Endpoint: DELETE /api/investigators/delete/{orcid}
    const response = await fetch(`${API_BASE_URL}/api/investigators/delete/${orcid}`, {
      method: "DELETE",
      headers: headers,
    });

    return response;
  } catch (error) {
    console.error("Error en deletePersonService:", error);
    throw new Error("Error de conexión al servidor");
  }
}