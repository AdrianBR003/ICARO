import { API_BASE } from "@/configAPI";

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
    const response = await fetch(`${API_BASE}/investigators/delete/${orcid}`, {
      method: "DELETE",
      headers: headers,
    });

    return response;
  } catch (error) {
    console.error("Error en deletePersonService:", error);
    throw new Error("Error de conexión al servidor");
  }
}