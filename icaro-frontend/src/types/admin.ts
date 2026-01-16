export interface SystemStatus {
  online: boolean;
  serviceName: string;
  version: string;
  memoryUsage: number; // Porcentaje de 0 a 100
  uptime?: string;
}