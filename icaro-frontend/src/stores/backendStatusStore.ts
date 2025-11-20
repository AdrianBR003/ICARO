import { atom } from "nanostores";

const API_BASE = "http://localhost:8080";


export const backendStatus = atom<"online" | "offline" | "checking">(
  "checking"
);

export async function checkBackend() {
  backendStatus.set("checking");
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    if(res.ok){
        backendStatus.set('online'); 
    }else{
        backendStatus.set('offline'); 
    }
  } catch (_) {
    backendStatus.set("offline");
  }
}

export function startBackendPolling(interval = 5000){
    checkBackend(); 
    setInterval(checkBackend, interval); 
}
