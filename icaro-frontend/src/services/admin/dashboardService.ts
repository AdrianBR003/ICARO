import { API_BASE } from "@/configAPI";

export interface DashboardStats {
  investigatorsCount: number;
  newsCount: number;
  worksCount: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const token = localStorage.getItem("adminToken");
  try {
    const response = await fetch(`${API_BASE}/admin/dashboard/stats`, {
      method: "GET",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) throw new Error("Error fetching stats");
    return await response.json();
  } catch (error) {
    console.error(error);
    return { investigatorsCount: 0, newsCount: 0, worksCount: 0 };
  }
};