import { API_BASE } from "@/configAPI";
import type { SystemStatus } from "@/types/admin";

// Función auxiliar para headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const response = await fetch(`${API_BASE}/admin/system/status`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Backend unreachable");
    
    return await response.json();
  } catch (error) {
    // Si falla, devolvemos un estado "offline" simulado para que la UI no rompa
    return {
      online: false,
      serviceName: "Spring Boot API",
      version: "Unknown",
      memoryUsage: 0
    };
  }
}

export async function restartServerService(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/admin/system/restart`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

export async function stopServerService(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/admin/system/shutdown`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}