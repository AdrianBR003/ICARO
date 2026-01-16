import { auditService, type AuditLog } from "@/services/admin/auditService";

let intervalId: ReturnType<typeof setInterval> | null = null;
const dom = { container: null as HTMLElement | null };

export function initActivityFeed() {
  dom.container = document.getElementById('activity-feed-list');
  if (!dom.container) return;

  loadFeed();
  startPolling(); // Polling cada 5s para ver si hay cambios en el archivo
  document.addEventListener('astro:before-swap', stopPolling);
}

function startPolling() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(loadFeed, 5000);
}

function stopPolling() {
  if (intervalId) clearInterval(intervalId);
}

async function loadFeed() {
  const logs = await auditService.fetchActivityFeed();
  renderFeed(logs);
}

function renderFeed(logs: AuditLog[]) {
  if (!dom.container) return;

  if (logs.length === 0) {
    dom.container.innerHTML = `<div class="text-center text-slate-400 py-10 text-sm italic">Sin historial de auditoría</div>`;
    return;
  }

  dom.container.innerHTML = logs.map(log => {
    // Lógica de colores según acción
    let colorClass = "bg-slate-100 text-slate-500";
    let iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`;

    if (log.action === 'CREATE') {
        colorClass = "bg-emerald-100 text-emerald-600";
        iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />`;
    } else if (log.action === 'UPDATE') {
        colorClass = "bg-blue-100 text-blue-600";
        iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />`;
    } else if (log.action === 'DELETE') {
        colorClass = "bg-red-100 text-red-600";
        iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />`;
    }

    return `
      <div class="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
        <div class="flex-shrink-0 h-10 w-10 rounded-full ${colorClass} flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">${iconSvg}</svg>
        </div>
        
        <div class="flex-1 min-w-0">
           <div class="flex justify-between items-start">
               <p class="text-sm font-medium text-slate-900">
                 <span class="font-bold">${log.actor}</span> <span class="text-slate-400 font-normal">hizo</span> ${log.action}
               </p>
               <span class="text-xs text-slate-400 whitespace-nowrap ml-2">${log.timestamp}</span>
           </div>
           
           <p class="text-sm text-slate-600 truncate mt-0.5">${log.details}</p>
           
           <div class="flex items-center gap-2 mt-1.5">
             <span class="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wide">${log.entity}</span>
             
             <span class="text-[10px] text-slate-300 font-mono truncate max-w-[200px] group-hover:text-slate-400 transition-colors" title="${log.url}">
                ${log.url}
             </span>
           </div>
        </div>
      </div>
    `;
  }).join('');
}