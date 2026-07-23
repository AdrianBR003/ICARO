import { logService } from "@/services/admin/logService";

let intervalId: ReturnType<typeof setInterval> | null = null;
let isFetching = false;
let shouldAutoScroll = true;

// Elementos cacheados
const dom = {
  container: null as HTMLElement | null,
  list: null as HTMLElement | null,
  dot: null as HTMLElement | null,
  ping: null as HTMLElement | null,
  clearBtn: null as HTMLElement | null,
  downloadBtn: null as HTMLElement | null,
};

export function initLiveLogs() {
  // 1. Referencias al DOM
  dom.container = document.getElementById('log-container'); // Importante
  dom.list = document.getElementById('log-list');
  dom.dot = document.getElementById('log-dot');
  dom.ping = document.getElementById('log-ping');
  dom.clearBtn = document.getElementById('clear-logs');
  dom.downloadBtn = document.getElementById('download-logs');

  if (!dom.list || !dom.container) return;

  // 2. Arrancar ciclo
  fetchAndRender();
  startPolling();

  // 3. Listeners
  attachListeners();
  attachScrollListener(); // NUEVO

  // 4. Limpieza
  document.addEventListener('astro:before-swap', stopPolling);
}

function attachScrollListener() {
    if (!dom.container) return;

    dom.container.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = dom.container!;
        
        // Calculamos si el usuario está "casi" al final (damos 20px de margen)
        // scrollHeight: Altura total del contenido
        // clientHeight: Altura visible de la ventana
        // scrollTop: Cuánto se ha bajado
        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
        
        // Si está a menos de 20px del final, activamos el auto-scroll
        // Si está más arriba, lo desactivamos para que pueda leer
        shouldAutoScroll = distanceFromBottom < 20;
    });
}
// ----------------------------------------------------

function startPolling() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(fetchAndRender, 3000);
}

function stopPolling() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}

async function fetchAndRender() {
  if (isFetching) return;
  isFetching = true;

  try {
    updateStatusIndicator('loading');
    const logs = await logService.fetchLiveLogs();
    renderLogs(logs);
    updateStatusIndicator('success');
  } catch (error) {
    updateStatusIndicator('error');
    if (dom.list && dom.list.children.length === 0) {
      dom.list.innerHTML = `<li class="text-red-400 italic">Error de conexión con el servidor de logs.</li>`;
    }
  } finally {
    isFetching = false;
  }
}

function renderLogs(logs: string[]) {
  if (!dom.list || !dom.container) return;
  
  const html = logs.map(line => `
    <li class="flex gap-2 hover:bg-white/5 p-0.5 rounded transition-colors break-all font-mono text-xs">
      ${formatLogLine(line)}
    </li>
  `).join('');

  dom.list.innerHTML = html;

  if (shouldAutoScroll) {
      dom.container.scrollTop = dom.container.scrollHeight;
  }
}

function formatLogLine(line: string): string {
  let msgStyle = "text-slate-300";
  
  if (line.includes("ERROR")) msgStyle = "text-red-400 font-bold";
  else if (line.includes("WARN")) msgStyle = "text-amber-400";
  else if (line.includes("INFO")) msgStyle = "text-blue-300";
  else if (line.includes("DEBUG")) msgStyle = "text-slate-500";

  const parts = line.split('|');
  if (parts.length >= 3) {
    const time = parts[0].trim();
    const level = parts[1].trim();
    const message = parts.slice(2).join('|').trim();

    return `
      <span class="text-slate-500 select-none">[${time}]</span>
      <span class="${msgStyle.replace('text-slate-300', '')} font-bold px-1">[${level}]</span>
      <span class="${msgStyle}">${message}</span>
    `;
  }
  
  return `<span class="text-slate-300">${line}</span>`;
}

function updateStatusIndicator(state: 'loading' | 'success' | 'error') {
  if (!dom.dot || !dom.ping) return;

  if (state === 'loading') {
    dom.dot.classList.replace('bg-slate-300', 'bg-green-500');
    dom.dot.classList.replace('bg-red-500', 'bg-green-500');
    dom.ping.classList.remove('hidden');
  } else if (state === 'success') {
    setTimeout(() => dom.ping?.classList.add('hidden'), 500);
  } else if (state === 'error') {
    dom.dot.classList.replace('bg-green-500', 'bg-red-500');
    dom.dot.classList.replace('bg-slate-300', 'bg-red-500');
    dom.ping.classList.add('hidden');
  }
}

function attachListeners() {
  dom.downloadBtn?.addEventListener('click', async () => {
    const blob = await logService.downloadLogFile();
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `icaro-logs-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } else {
      alert("No se pudo descargar el log.");
    }
  });

  dom.clearBtn?.addEventListener('click', async () => {
    if (confirm("¿Limpiar memoria de logs del servidor?")) {
      const success = await logService.clearServerLogs();
      if (success && dom.list) {
        dom.list.innerHTML = '<li class="text-slate-500 italic">Logs limpiados. Esperando nuevos eventos...</li>';
        shouldAutoScroll = true; // Reseteamos el scroll al limpiar
      }
    }
  });
}