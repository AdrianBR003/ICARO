// src/services/general/loaderService.ts
import { backendStatus } from "@/stores/backendStatusStore";

export type LoaderState = 'loading' | 'error' | 'empty' | 'hidden';

export interface LoaderConfig {
  loaderId: string;
  messages?: {
    loading?: string;
    error?: string;
    empty?: string;
  };
}

/**
 * Actualiza el estado visual del loader
 */
export function updateLoaderState(
  loaderId: string,
  state: LoaderState,
  customMessage?: string
): void {
  // console.log(`🎨 [LOADER UPDATE] ID: ${loaderId} -> ${state}`);
  
  const loader = document.getElementById(loaderId);
  if (!loader) return;

  const loaderText = loader.querySelector('p');
  
  // CAMBIO CLAVE: Seleccionamos TODOS los paths del SVG para cambiarles el color
  const svgPaths = loader.querySelectorAll('svg path');

  const defaultMessages: Record<LoaderState, string> = {
    loading: 'Cargando datos...',
    error: 'Error en el servidor',
    empty: 'No hay datos disponibles',
    hidden: ''
  };

  const message = customMessage || defaultMessages[state];

  // --- OCULTAR ---
  if (state === 'hidden') {
    loader.style.transition = 'opacity 0.3s ease';
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      loader.classList.add('hidden');
    }, 300);
    return;
  }

  // --- MOSTRAR ---
  loader.classList.remove('hidden');
  loader.style.display = 'flex';
  // Forzar repintado inmediato
  requestAnimationFrame(() => {
      loader.style.opacity = '1';
  });

  // --- DEFINICIÓN DE COLORES ---
  // Usamos colores hexadecimales exactos
  const colors: Record<LoaderState, string> = {
      loading: '#006D38', // Verde Corporativo
      error: '#ef4444',   // Rojo (Tailwind red-500)
      empty: '#ca8a04',   // Amarillo (Tailwind yellow-600 - más legible que yellow-400)
      hidden: '#006D38'
  };
  
  const targetColor = colors[state] || colors.loading;

  // 1. Actualizar Texto
  if (loaderText) {
    loaderText.innerText = message;
    // Usamos style.color directamente para evitar conflictos de clases
    loaderText.style.color = targetColor;
  }

  // 2. Actualizar SVG (LA SOLUCIÓN)
  svgPaths.forEach((path) => {
      const el = path as SVGPathElement;
      // Forzamos el estilo inline, que tiene máxima prioridad
      el.style.stroke = targetColor;
  });
}

export function hideLoader(loaderOrId: HTMLElement | string): void {
  const loader = typeof loaderOrId === 'string' 
    ? document.getElementById(loaderOrId) 
    : loaderOrId; 
  if (!loader) return;
  
  updateLoaderState(loader.id, 'hidden');
}

export function showLoader(loaderId: string, message?: string): void {
  updateLoaderState(loaderId, 'loading', message);
}

/**
 * Wrapper genérico para cargar datos con manejo automático del loader
 */
export async function loadWithLoader<T>(
  loaderId: string,
  loadFunction: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    onEmpty?: () => void;
    messages?: LoaderConfig['messages'];
    checkEmpty?: (data: T) => boolean; // Nueva opción para verificar si está vacío
  }
): Promise<T | null> {
  const status = backendStatus.get();

  console.log(`📊 [LOADER] Backend status: ${status}`);

  // Si el backend está offline o checking, mostrar error
  if (status === 'offline' || status === 'checking') {
    updateLoaderState(loaderId, 'error', options?.messages?.error);
    return null;
  }

  // Mostrar estado de carga
  updateLoaderState(loaderId, 'loading', options?.messages?.loading);

  try {
    console.log('📡 [LOADER] Ejecutando loadFunction...');
    const data = await loadFunction();
    console.log('✅ [LOADER] Datos recibidos:', data);

    // Verificar si hay datos usando función personalizada o verificación por defecto
    const isEmpty = options?.checkEmpty 
      ? options.checkEmpty(data)
      : !data || (Array.isArray(data) && data.length === 0);

    console.log(`🔍 [LOADER] ¿Está vacío? ${isEmpty}`);

    if (isEmpty) {
      console.log('🟡 [LOADER] Sin datos -> Estado EMPTY');
      updateLoaderState(loaderId, 'empty', options?.messages?.empty);
      if (options?.onEmpty) {
        options.onEmpty();
      }
      return null;
    }

    // Éxito con datos
    console.log('✨ [LOADER] Con datos -> Ejecutando onSuccess');
    if (options?.onSuccess) {
      options.onSuccess(data);
    }
    
    hideLoader(loaderId);
    return data;

  } catch (error) {
    console.error('🔴 [LOADER] ERROR capturado:', error);
    updateLoaderState(loaderId, 'error', options?.messages?.error);

    if (options?.onError) {
      options.onError(error as Error);
    }

    // Marcar backend como offline
    backendStatus.set('offline');
    return null;
  }
}

export function subscribeToBackendStatus(
  loaderId: string,
  onOnline: () => void | Promise<void>,
  options?: LoaderConfig['messages']
): () => void {
  const unsubscribe = backendStatus.subscribe((status) => {
    if (status === 'online') {
      onOnline();
    } else if (status === 'offline') {
      updateLoaderState(loaderId, 'error', options?.error);
    }
  });

  return unsubscribe;
}