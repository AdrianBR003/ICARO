const isDev = import.meta.env.DEV;

export const API_BASE = isDev 
    // DESARROLLO (npm run dev): 
    ? "http://localhost:8080/api"  
    // PRODUCCIÓN (Docker): Nginx se encarga del HTTPS
    : "/api";

export const API_URL = isDev
    ? "http://localhost:8080"      
    : ""; 

export const WS_BASE = isDev
    ? "ws://localhost:8080/ws-logs" 
    : "/ws-logs"; 