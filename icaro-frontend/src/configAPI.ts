// Detectamos el entorno
const isDev = import.meta.env.DEV; // Por defecto en 'false'
const isServer = import.meta.env.SSR;
const INTERNAL_BACKEND = process.env.INTERNAL_API_URL || "http://icaro_backend:8080";

// 1. Valores POR DEFECTO (Producción en el Navegador / Cliente)
let apiBase = "/api";
let apiUrl = "";
let wsBase = "/ws-logs";

// 2. Si estamos en DESARROLLO LOCAL (npm run dev)
if (isDev) {
  apiBase = "http://localhost:8080/api";
  apiUrl = "http://localhost:8080";
  wsBase = "ws://localhost:8080/ws-logs";
} 
// 3. Si estamos en PRODUCCIÓN pero ejecutando en SERVIDOR (SSR / Node / Docker)
else if (isServer) {
  apiBase = `${INTERNAL_BACKEND}/api`;
  apiUrl = INTERNAL_BACKEND;
  wsBase = `ws://icaro_backend:8080/ws-logs`;
}

// Exportamos las constantes finales
export const API_BASE = apiBase;
export const API_URL = apiUrl;
export const WS_BASE = wsBase;