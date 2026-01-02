const API_BASE_URL = "http://localhost:8080";

export async function createPersonService(personData: any): Promise<Response> {
  const token = localStorage.getItem("adminToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/investigators/save`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(personData),
    });

    return response; // Devolvemos response para que el modal maneje 201 o 409
  } catch (error) {
    console.error("Error en createPersonService:", error);
    throw new Error("Error de conexión al servidor");
  }
}