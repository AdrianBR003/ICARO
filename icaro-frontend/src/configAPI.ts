// Detecta si estamos en modo desarrollo (npm run dev)
const isDev = import.meta.env.DEV;
// Detecta si el código se está ejecutando en el servidor (Node) o en el navegador
const isServer = import.meta.env.SSR;

// Leemos la variable de entorno que pusimos en el docker-compose o usamos el fallback
const INTERNAL_BACKEND = process.env.INTERNAL_API_URL;

export const API_BASE = isDev
    // 1. DESARROLLO (Local)
    ? "http://localhost:8080/api"
    : isServer
        // 2. PRODUCCIÓN (SSR - Servidor)
        ? `${INTERNAL_BACKEND}/api`
        // 3. PRODUCCIÓN (Cliente - Navegador)
        : "/api";

export const API_URL = isDev
    ? "http://localhost:8080"
    : isServer
        ? INTERNAL_BACKEND
        : ""; 

export const WS_BASE = isDev
    ? "ws://localhost:8080/ws-logs"
    : isServer
        ? `ws://icaro_backend:8080/ws-logs`
        : "/ws-logs";