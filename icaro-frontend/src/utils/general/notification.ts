import { notifyId } from "node_modules/nanostores/atom";

// Definimos los tipos de notificación.
type NotificacionType = "success" | "error" | "warning" | "info";

interface NotificationData {
  element: HTMLElement;
  timeout: number | null;
}

class NotificacionSystem {
  private container: HTMLElement | null = null;
  private notifications = new Map<string, NotificationData>();
  private counter = 0;
  isInitialized = false;

  constructor() {
    // El sistema se inicaliza cuando el DOM esté listo.
    if (typeof window !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.init());
      } else {
        this.init();
      }
    }
  }

  private init(): void {
    this.container = document.getElementById("notification-container");
    if (!this.container) {
      console.error("Contenedor de notificaciones no encontrado");
      return;
    }
    this.isInitialized = true;
    this.processStoredNotifications();
    console.log("Sistema de notificaciones inicializado");
  }

  private createNotification(
    id: string,
    message: string,
    type: NotificacionType
  ): HTMLElement {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.id = id;

    const icons: Record<NotificacionType, string> = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };

    notification.innerHTML = `
      <div class="notification-icon">${icons[type]}</div>
      <div class="notification-message">${message}</div>
      <button class="notification-close" data-id="${id}" aria-label="Cerrar">×</button>
    `;

    notification
      .querySelector(".notification-close")
      ?.addEventListener("click", () => this.removeNotification(id));
    return notification;
  }

  private removeNotification(id: string) {
    const data = this.notifications.get(id);
    if (!data) return;
    if (data.timeout) clearTimeout(data.timeout);
    data.element.classList.remove("show");

    setTimeout(() => {
      data.element.remove();
      this.notifications.delete(id);
    }, 300);
  }

  // Metodos Publicos

  public notify(
    message: string,
    type: NotificacionType = "info",
    duration = 4000
  ) {
    if (!this.isInitialized || !this.container) {
      // Si no está listo, lo guardamos para mostrarlo al recargar la página
      this.saveNotificationToStorage(message, type, duration);
      window.location.reload(); // Forzamos recarga para que el sistema se inicie y muestre
      return;
    }

    const id = `notification-${++this.counter}`;
    const element = this.createNotification(id, message, type);
    this.container.appendChild(element);

    const timeout =
      duration > 0
        ? window.setTimeout(() => this.removeNotification(id), duration)
        : null;
    this.notifications.set(id, { element, timeout });

    requestAnimationFrame(() => element.classList.add("show"));
  }

  public success(message: string, duration?: number) {
    this.notify(message, "success", duration);
  }
  public error(message: string, duration?: number) {
    this.notify(message, "error", duration);
  }
  public warning(message: string, duration?: number) {
    this.notify(message, "warning", duration);
  }
  public info(message: string, duration?: number) {
    this.notify(message, "info", duration);
  }

  // --- LÓGICA DE LOCALSTORAGE ---

  private saveNotificationToStorage(
    message: string,
    type: NotificacionType,
    duration: number
  ) {
    try {
      const pending = JSON.parse(
        localStorage.getItem("pendingNotifications") || "[]"
      );
      pending.push({ message, type, duration });
      localStorage.setItem("pendingNotifications", JSON.stringify(pending));
    } catch (e) {
      console.error("Error guardando notificación en localStorage", e);
    }
  }

  private processStoredNotifications() {
    try {
      const pending = JSON.parse(
        localStorage.getItem("pendingNotifications") || "[]"
      );
      if (pending.length > 0) {
        pending.forEach((n: any) => this.notify(n.message, n.type, n.duration));
        localStorage.removeItem("pendingNotifications");
      }
    } catch (e) {
      console.error("Error procesando notificaciones de localStorage", e);
    }
  }
}

export const notifications = new NotificacionSystem();
