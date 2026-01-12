import { API_BASE } from "@/configAPI";

export async function updateProjectService(projectData: any): Promise<Response> {
  const token = localStorage.getItem("adminToken");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}/project/update`, {
      method: "POST", // O PUT, según tu backend
      headers: headers,
      body: JSON.stringify(projectData),
    });
    return response;
  } catch (error) {
    throw new Error("Error de conexión al servidor");
  }
}