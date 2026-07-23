import { API_BASE } from "@/configAPI";

export async function deleteProjectService(projectId: string): Promise<Response> {
  const token = localStorage.getItem("adminToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}/project/delete/${projectId}`, {
      method: "DELETE",
      headers: headers,
    });
    return response;
  } catch (error) {
    throw new Error("Error de conexión al servidor");
  }
}