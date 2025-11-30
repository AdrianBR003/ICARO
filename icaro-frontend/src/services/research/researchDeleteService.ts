const API_BASE_URL = "http://localhost:8080";

export async function deleteResearchService(id: string): Promise<Response> {
  const token = localStorage.getItem("adminToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/works/delete/${id}`, {
      method: "DELETE",
      headers: headers,
    });

    return response;
  } catch (error) {
    console.error("Error en deleteResearchService:", error);
    throw new Error("Error de conexión al servidor");
  }
}