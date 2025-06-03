export interface BrushingEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  timestamp: string; // ISO string
  confirmed: boolean;
  reminderTime?: string; // HH:MM format
}

export interface AppSettings {
  reminderTimes: string[]; // Array of HH:MM format times
  soundEnabled: boolean;
  volume: number; // 0-1
  selectedSound: string;
  alarmDelay: number; // minutes
  timeFormat: "12h" | "24h"; // Time format preference
}

export interface BrushingStats {
  totalDays: number;
  brushedDays: number;
  currentStreak: number;
  longestStreak: number;
  averagePerWeek: number;
  lastBrushed?: string;
}

const STORAGE_KEYS = {
  BRUSHING_ENTRIES: "zahnputz_entries",
  SETTINGS: "zahnputz_settings",
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  reminderTimes: ["08:00", "20:00"],
  soundEnabled: true,
  volume: 0.7,
  selectedSound: "chime",
  alarmDelay: 30,
  timeFormat: "24h",
};

// Storage utilities with SQL-like interface
export class BrushingStorage {
  // Get all brushing entries
  static getAllEntries(): BrushingEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BRUSHING_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading entries:", error);
      return [];
    }
  }

  // Insert new brushing entry
  static insertEntry(entry: Omit<BrushingEntry, "id">): BrushingEntry {
    const entries = this.getAllEntries();
    const newEntry: BrushingEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };

    entries.push(newEntry);
    localStorage.setItem(
      STORAGE_KEYS.BRUSHING_ENTRIES,
      JSON.stringify(entries),
    );
    return newEntry;
  }

  // Update existing entry
  static updateEntry(id: string, updates: Partial<BrushingEntry>): boolean {
    const entries = this.getAllEntries();
    const index = entries.findIndex((entry) => entry.id === id);

    if (index === -1) return false;

    entries[index] = { ...entries[index], ...updates };
    localStorage.setItem(
      STORAGE_KEYS.BRUSHING_ENTRIES,
      JSON.stringify(entries),
    );
    return true;
  }

  // Get entries by date range
  static getEntriesByDateRange(
    startDate: string,
    endDate: string,
  ): BrushingEntry[] {
    const entries = this.getAllEntries();
    return entries.filter(
      (entry) => entry.date >= startDate && entry.date <= endDate,
    );
  }

  // Get entry for specific date
  static getEntryByDate(date: string): BrushingEntry | null {
    const entries = this.getAllEntries();
    return entries.find((entry) => entry.date === date) || null;
  }

  // Check if brushed today
  static hasBrushedToday(): boolean {
    const today = this.getTodayDateString();
    const entry = this.getEntryByDate(today);
    return entry?.confirmed || false;
  }

  // Get today's date string in local timezone
  static getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Mark brushing as confirmed for today
  static confirmBrushingToday(): BrushingEntry {
    const today = this.getTodayDateString();
    const existing = this.getEntryByDate(today);

    if (existing) {
      this.updateEntry(existing.id, {
        confirmed: true,
        timestamp: new Date().toISOString(),
      });
      return {
        ...existing,
        confirmed: true,
        timestamp: new Date().toISOString(),
      };
    } else {
      return this.insertEntry({
        date: today,
        timestamp: new Date().toISOString(),
        confirmed: true,
      });
    }
  }

  // Delete entry
  static deleteEntry(id: string): boolean {
    const entries = this.getAllEntries();
    const filtered = entries.filter((entry) => entry.id !== id);

    if (filtered.length === entries.length) return false;

    localStorage.setItem(
      STORAGE_KEYS.BRUSHING_ENTRIES,
      JSON.stringify(filtered),
    );
    return true;
  }

  // Clear all entries
  static clearAllEntries(): void {
    localStorage.removeItem(STORAGE_KEYS.BRUSHING_ENTRIES);
  }
}

export class SettingsStorage {
  // Get settings
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
        : DEFAULT_SETTINGS;
    } catch (error) {
      console.error("Error loading settings:", error);
      return DEFAULT_SETTINGS;
    }
  }

  // Update settings
  static updateSettings(updates: Partial<AppSettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  }

  // Reset to defaults
  static resetSettings(): void {
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(DEFAULT_SETTINGS),
    );
  }
}

// Statistics calculations
export class BrushingAnalytics {
  static getStats(): BrushingStats {
    const entries = BrushingStorage.getAllEntries();
    const confirmedEntries = entries.filter((entry) => entry.confirmed);

    if (confirmedEntries.length === 0) {
      return {
        totalDays: 0,
        brushedDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        averagePerWeek: 0,
      };
    }

    // Calculate streaks
    const sortedDates = confirmedEntries
      .map((entry) => entry.date)
      .sort()
      .reverse(); // Most recent first

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check current streak (starting from today)
    const today = new Date();
    let checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (sortedDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    const allDates = confirmedEntries.map((entry) => entry.date).sort();
    for (let i = 0; i < allDates.length; i++) {
      const currentDate = new Date(allDates[i]);
      const nextDate =
        i < allDates.length - 1 ? new Date(allDates[i + 1]) : null;

      tempStreak++;

      if (
        !nextDate ||
        nextDate.getTime() - currentDate.getTime() > 24 * 60 * 60 * 1000
      ) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    // Calculate average per week (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEntries = confirmedEntries.filter(
      (entry) => new Date(entry.date) >= thirtyDaysAgo,
    );
    const averagePerWeek = (recentEntries.length / 30) * 7;

    const lastBrushed =
      confirmedEntries.length > 0
        ? confirmedEntries.sort((a, b) =>
            b.timestamp.localeCompare(a.timestamp),
          )[0].date
        : undefined;

    return {
      totalDays: entries.length,
      brushedDays: confirmedEntries.length,
      currentStreak,
      longestStreak,
      averagePerWeek: Math.round(averagePerWeek * 10) / 10,
      lastBrushed,
    };
  }

  // Get weekly data for charts
  static getWeeklyData(
    weeks = 12,
  ): Array<{ week: string; brushed: number; total: number }> {
    const entries = BrushingStorage.getAllEntries();
    const data: Array<{ week: string; brushed: number; total: number }> = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekStartStr = weekStart.toISOString().split("T")[0];
      const weekEndStr = weekEnd.toISOString().split("T")[0];

      const weekEntries = entries.filter(
        (entry) => entry.date >= weekStartStr && entry.date <= weekEndStr,
      );

      const brushedCount = weekEntries.filter(
        (entry) => entry.confirmed,
      ).length;

      data.push({
        week: `${weekStart.getDate().toString().padStart(2, "0")}.${(weekStart.getMonth() + 1).toString().padStart(2, "0")}`,
        brushed: brushedCount,
        total: 7, // Days per week
      });
    }

    return data;
  }
}
