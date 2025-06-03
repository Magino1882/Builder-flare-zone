import { useState, useEffect, useCallback, useRef } from "react";
import { SettingsStorage, AppSettings } from "@/lib/storage";
import {
  notificationManager,
  scheduleReminders,
  cancelAllReminders,
} from "@/lib/notifications";
import { audioManager } from "@/lib/audio";
import { useBrushingData } from "./useBrushingData";

export interface UseRemindersReturn {
  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Reminder state
  activeReminders: string[];
  nextReminder: Date | null;
  isReminderActive: boolean;

  // Actions
  scheduleAllReminders: () => void;
  cancelAllReminders: () => void;
  snoozeReminder: (minutes?: number) => void;
  dismissReminder: () => void;

  // Alarm system
  isAlarmActive: boolean;
  alarmTimeout: number | null;

  // Permission
  hasNotificationPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useReminders(): UseRemindersReturn {
  const [settings, setSettings] = useState<AppSettings>(
    SettingsStorage.getSettings(),
  );
  const [activeReminders, setActiveReminders] = useState<string[]>([]);
  const [nextReminder, setNextReminder] = useState<Date | null>(null);
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [alarmTimeout, setAlarmTimeout] = useState<number | null>(null);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(
    notificationManager.getPermissionStatus() === "granted",
  );

  const { hasBrushedToday } = useBrushingData();
  const alarmTimeoutRef = useRef<number | null>(null);
  const reminderCheckRef = useRef<number | null>(null);

  // Update audio manager when settings change
  useEffect(() => {
    audioManager.setVolume(settings.volume);
    audioManager.setEnabled(settings.soundEnabled);
  }, [settings.volume, settings.soundEnabled]);

  // Load settings on mount
  useEffect(() => {
    const savedSettings = SettingsStorage.getSettings();
    setSettings(savedSettings);
  }, []);

  // Update settings
  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      SettingsStorage.updateSettings(updates);
    },
    [settings],
  );

  // Request notification permission
  const requestPermission = useCallback(async () => {
    const granted = await notificationManager.requestPermission();
    setHasNotificationPermission(granted);
    return granted;
  }, []);

  // Calculate next reminder time
  const calculateNextReminder = useCallback(() => {
    if (!settings.reminderTimes.length) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find next reminder time today
    for (const timeStr of settings.reminderTimes.sort()) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const reminderTime = new Date(today);
      reminderTime.setHours(hours, minutes, 0, 0);

      if (reminderTime > now) {
        return reminderTime;
      }
    }

    // If no reminders left today, get first reminder tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = settings.reminderTimes
      .sort()[0]
      .split(":")
      .map(Number);
    tomorrow.setHours(hours, minutes, 0, 0);

    return tomorrow;
  }, [settings.reminderTimes]);

  // Check if we should show reminder or alarm
  const checkReminderStatus = useCallback(() => {
    if (hasBrushedToday) {
      setIsReminderActive(false);
      setIsAlarmActive(false);
      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current);
        alarmTimeoutRef.current = null;
        setAlarmTimeout(null);
      }
      return;
    }

    const now = new Date();
    const nextRem = calculateNextReminder();
    setNextReminder(nextRem);

    // Check if we should show a reminder
    if (nextRem && nextRem <= now) {
      setIsReminderActive(true);

      // Schedule alarm if not already scheduled
      if (!alarmTimeoutRef.current && !isAlarmActive) {
        const alarmTime = settings.alarmDelay * 60 * 1000; // Convert minutes to ms
        alarmTimeoutRef.current = window.setTimeout(() => {
          if (!hasBrushedToday) {
            setIsAlarmActive(true);
            showAlarm();
          }
        }, alarmTime);
        setAlarmTimeout(alarmTimeoutRef.current);
      }
    }
  }, [
    hasBrushedToday,
    calculateNextReminder,
    settings.alarmDelay,
    isAlarmActive,
  ]);

  // Show reminder notification and sound
  const showReminder = useCallback(async () => {
    if (hasNotificationPermission) {
      await notificationManager.showBrushingReminder();
    }

    if (settings.soundEnabled) {
      await audioManager.playReminder(settings.selectedSound as any);
    }
  }, [
    hasNotificationPermission,
    settings.soundEnabled,
    settings.selectedSound,
  ]);

  // Show alarm notification and sound
  const showAlarm = useCallback(async () => {
    if (hasNotificationPermission) {
      await notificationManager.showBrushingAlarm();
    }

    if (settings.soundEnabled) {
      await audioManager.playAlarm();
    }
  }, [hasNotificationPermission, settings.soundEnabled]);

  // Schedule all daily reminders
  const scheduleAllReminders = useCallback(() => {
    cancelAllReminders();

    if (hasNotificationPermission && settings.reminderTimes.length > 0) {
      const reminderIds = scheduleReminders(settings.reminderTimes);
      setActiveReminders(reminderIds);
    }
  }, [hasNotificationPermission, settings.reminderTimes]);

  // Cancel all reminders
  const cancelAllRemindersHandler = useCallback(() => {
    cancelAllReminders();
    setActiveReminders([]);
    setIsReminderActive(false);
    setIsAlarmActive(false);

    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
      setAlarmTimeout(null);
    }
  }, []);

  // Snooze reminder
  const snoozeReminder = useCallback((minutes = 10) => {
    setIsReminderActive(false);

    // Schedule new reminder
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);

    const snoozeId = notificationManager.scheduleNotification(snoozeTime, {
      title: "🦷 Erinnerung: Zähne putzen!",
      body: `Snooze-Zeit ist vorbei - Zeit zum Zähne putzen!`,
      icon: "🦷",
      tag: "brushing-snooze",
      requireInteraction: true,
    });

    setActiveReminders((prev) => [...prev, snoozeId]);
  }, []);

  // Dismiss reminder
  const dismissReminder = useCallback(() => {
    setIsReminderActive(false);
    notificationManager.clearAllNotifications();
  }, []);

  // Set up periodic checking
  useEffect(() => {
    // Check reminder status every minute
    reminderCheckRef.current = window.setInterval(checkReminderStatus, 60000);

    // Initial check
    checkReminderStatus();

    return () => {
      if (reminderCheckRef.current) {
        clearInterval(reminderCheckRef.current);
      }
      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current);
      }
    };
  }, [checkReminderStatus]);

  // Schedule reminders when settings change
  useEffect(() => {
    if (hasNotificationPermission) {
      scheduleAllReminders();
    }
  }, [hasNotificationPermission, settings.reminderTimes, scheduleAllReminders]);

  // Show reminder when it becomes active
  useEffect(() => {
    if (isReminderActive) {
      showReminder();
    }
  }, [isReminderActive, showReminder]);

  return {
    // Settings
    settings,
    updateSettings,

    // Reminder state
    activeReminders,
    nextReminder,
    isReminderActive,

    // Actions
    scheduleAllReminders,
    cancelAllReminders: cancelAllRemindersHandler,
    snoozeReminder,
    dismissReminder,

    // Alarm system
    isAlarmActive,
    alarmTimeout,

    // Permission
    hasNotificationPermission,
    requestPermission,
  };
}
