export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

export interface ReminderNotification {
  id: string;
  scheduledFor: Date;
  type: "reminder" | "alarm";
  options: NotificationOptions;
}

class NotificationManager {
  private static instance: NotificationManager;
  private permission: NotificationPermission = "default";
  private activeNotifications = new Map<string, Notification>();
  private scheduledNotifications = new Map<string, number>(); // timeout IDs

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  constructor() {
    this.checkPermission();
    this.setupVisibilityHandling();
  }

  private checkPermission(): void {
    if ("Notification" in window) {
      this.permission = Notification.permission;
    }
  }

  private setupVisibilityHandling(): void {
    // Clear notifications when page becomes visible
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.clearAllNotifications();
      }
    });
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("Browser does not support notifications");
      return false;
    }

    if (this.permission === "granted") {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  // Check if notifications are supported and permitted
  isSupported(): boolean {
    return "Notification" in window && this.permission === "granted";
  }

  // Show immediate notification
  async showNotification(options: NotificationOptions): Promise<string | null> {
    if (!this.isSupported()) {
      console.warn("Notifications not supported or permitted");
      return null;
    }

    try {
      const id = crypto.randomUUID();
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "🦷",
        badge: options.badge || "🦷",
        tag: options.tag || id,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
        actions: options.actions || [],
      });

      // Store notification reference
      this.activeNotifications.set(id, notification);

      // Auto-close after 10 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          this.closeNotification(id);
        }, 10000);
      }

      // Handle notification events
      notification.onclick = () => {
        window.focus();
        this.closeNotification(id);
      };

      notification.onclose = () => {
        this.activeNotifications.delete(id);
      };

      notification.onerror = (error) => {
        console.error("Notification error:", error);
        this.activeNotifications.delete(id);
      };

      return id;
    } catch (error) {
      console.error("Error showing notification:", error);
      return null;
    }
  }

  // Schedule notification for future
  scheduleNotification(
    scheduledFor: Date,
    options: NotificationOptions,
  ): string {
    const id = crypto.randomUUID();
    const delay = scheduledFor.getTime() - Date.now();

    if (delay <= 0) {
      // Show immediately if time has passed
      this.showNotification(options);
      return id;
    }

    const timeoutId = window.setTimeout(() => {
      this.showNotification(options);
      this.scheduledNotifications.delete(id);
    }, delay);

    this.scheduledNotifications.set(id, timeoutId);
    return id;
  }

  // Cancel scheduled notification
  cancelScheduledNotification(id: string): boolean {
    const timeoutId = this.scheduledNotifications.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(id);
      return true;
    }
    return false;
  }

  // Close specific notification
  closeNotification(id: string): boolean {
    const notification = this.activeNotifications.get(id);
    if (notification) {
      notification.close();
      this.activeNotifications.delete(id);
      return true;
    }
    return false;
  }

  // Clear all active notifications
  clearAllNotifications(): void {
    this.activeNotifications.forEach((notification) => {
      notification.close();
    });
    this.activeNotifications.clear();
  }

  // Cancel all scheduled notifications
  cancelAllScheduled(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  // Get permission status
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // Show brushing reminder
  async showBrushingReminder(): Promise<string | null> {
    return this.showNotification({
      title: "🦷 Zeit zum Zähne putzen!",
      body: "Vergiss nicht, deine Zähne zu putzen für eine gesunde Mundhygiene.",
      icon: "🦷",
      tag: "brushing-reminder",
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      actions: [
        { action: "confirm", title: "Erledigt ✓" },
        { action: "snooze", title: "Später erinnern" },
      ],
    });
  }

  // Show brushing alarm (after delay)
  async showBrushingAlarm(): Promise<string | null> {
    return this.showNotification({
      title: "⚠️ Erinnerung: Zähne putzen!",
      body: "Du hast noch nicht bestätigt, dass du deine Zähne geputzt hast. Bitte hole es nach!",
      icon: "⚠️",
      tag: "brushing-alarm",
      requireInteraction: true,
      vibrate: [500, 200, 500, 200, 500],
      actions: [
        { action: "confirm", title: "Jetzt erledigt ✓" },
        { action: "dismiss", title: "Ignorieren" },
      ],
    });
  }

  // Schedule daily reminders
  scheduleDailyReminders(times: string[]): string[] {
    const ids: string[] = [];
    const today = new Date();

    times.forEach((timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduledTime.getTime() <= Date.now()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const id = this.scheduleNotification(scheduledTime, {
        title: "🦷 Zeit zum Zähne putzen!",
        body: `Es ist ${timeStr} Uhr - Zeit für deine Zahnhygiene!`,
        icon: "🦷",
        tag: `daily-reminder-${timeStr}`,
        requireInteraction: true,
        vibrate: [200, 100, 200],
      });

      ids.push(id);
    });

    return ids;
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// Utility functions
export async function requestNotificationPermission(): Promise<boolean> {
  return notificationManager.requestPermission();
}

export function isNotificationSupported(): boolean {
  return notificationManager.isSupported();
}

export async function showToothbrushReminder(): Promise<string | null> {
  return notificationManager.showBrushingReminder();
}

export async function showToothbrushAlarm(): Promise<string | null> {
  return notificationManager.showBrushingAlarm();
}

export function scheduleReminders(times: string[]): string[] {
  return notificationManager.scheduleDailyReminders(times);
}

export function cancelReminder(id: string): boolean {
  return notificationManager.cancelScheduledNotification(id);
}

export function cancelAllReminders(): void {
  notificationManager.cancelAllScheduled();
}
