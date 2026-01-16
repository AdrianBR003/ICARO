import { API_BASE } from "@/configAPI";

// Helper privado para headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("adminToken");
  return { 
    "Authorization": token ? `Bearer ${token}` : "",
    "Content-Type": "application/json"
  };
};

export const logService = {
  /**
   * Obtiene las últimas líneas de log (JSON)
   */
  async fetchLiveLogs(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}/admin/logs/live`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error("Error fetching logs");
      return await response.json();
    } catch (error) {
      console.error("LogService Error:", error);
      throw error;
    }
  },

  /**
   * Descarga el archivo de logs completo (Blob)
   */
  async downloadLogFile(): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE}/admin/logs/download`, {
        method: "GET",
        headers: getAuthHeaders(), // Headers sin Content-Type json para descarga
      });

      if (!response.ok) return null;
      return await response.blob();
    } catch (error) {
      console.error("Download Error:", error);
      return null;
    }
  },

  /**
   * Limpia los logs del servidor (RAM)
   */
  async clearServerLogs(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/admin/logs/clear`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};