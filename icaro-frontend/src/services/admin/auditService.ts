import { API_BASE } from "@/configAPI";

export interface AuditLog {
  timestamp: string;
  actor: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'ERROR';
  entity: string;
  details: string;
  url: string;
}

const getHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return { "Authorization": token ? `Bearer ${token}` : "" };
};

export const auditService = {
  async fetchActivityFeed(): Promise<AuditLog[]> {
    try {
      // Llamamos al endpoint que lee del archivo
      const response = await fetch(`${API_BASE}/admin/audit/recent`, {
        method: "GET",
        headers: getHeaders(),
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Audit Error:", error);
      return [];
    }
  }
};