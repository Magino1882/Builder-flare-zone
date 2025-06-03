import { useState, useEffect, useCallback } from "react";
import {
  BrushingStorage,
  BrushingEntry,
  BrushingStats,
  BrushingAnalytics,
} from "@/lib/storage";

export interface UseBrushingDataReturn {
  // Data
  entries: BrushingEntry[];
  todayEntry: BrushingEntry | null;
  hasBrushedToday: boolean;
  stats: BrushingStats;

  // Actions
  confirmBrushing: () => void;
  addEntry: (entry: Omit<BrushingEntry, "id">) => void;
  updateEntry: (id: string, updates: Partial<BrushingEntry>) => void;
  deleteEntry: (id: string) => void;

  // Utilities
  getEntryByDate: (date: string) => BrushingEntry | null;
  getEntriesInRange: (startDate: string, endDate: string) => BrushingEntry[];
  refreshData: () => void;

  // Loading state
  isLoading: boolean;
}

export function useBrushingData(): UseBrushingDataReturn {
  const [entries, setEntries] = useState<BrushingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage
  const loadData = useCallback(() => {
    try {
      setIsLoading(true);
      const allEntries = BrushingStorage.getAllEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error("Error loading brushing data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Computed values
  const todayEntry =
    entries.find((entry) => {
      const today = new Date().toISOString().split("T")[0];
      return entry.date === today;
    }) || null;

  const hasBrushedToday = todayEntry?.confirmed || false;

  const stats = BrushingAnalytics.getStats();

  // Actions
  const confirmBrushing = useCallback(() => {
    try {
      const newEntry = BrushingStorage.confirmBrushingToday();
      setEntries((prev) => {
        const filtered = prev.filter((entry) => entry.id !== newEntry.id);
        return [...filtered, newEntry];
      });
    } catch (error) {
      console.error("Error confirming brushing:", error);
    }
  }, []);

  const addEntry = useCallback((entryData: Omit<BrushingEntry, "id">) => {
    try {
      const newEntry = BrushingStorage.insertEntry(entryData);
      setEntries((prev) => [...prev, newEntry]);
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  }, []);

  const updateEntry = useCallback(
    (id: string, updates: Partial<BrushingEntry>) => {
      try {
        const success = BrushingStorage.updateEntry(id, updates);
        if (success) {
          setEntries((prev) =>
            prev.map((entry) =>
              entry.id === id ? { ...entry, ...updates } : entry,
            ),
          );
        }
      } catch (error) {
        console.error("Error updating entry:", error);
      }
    },
    [],
  );

  const deleteEntry = useCallback((id: string) => {
    try {
      const success = BrushingStorage.deleteEntry(id);
      if (success) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  }, []);

  // Utility functions
  const getEntryByDate = useCallback(
    (date: string) => {
      return entries.find((entry) => entry.date === date) || null;
    },
    [entries],
  );

  const getEntriesInRange = useCallback(
    (startDate: string, endDate: string) => {
      return entries.filter(
        (entry) => entry.date >= startDate && entry.date <= endDate,
      );
    },
    [entries],
  );

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    // Data
    entries,
    todayEntry,
    hasBrushedToday,
    stats,

    // Actions
    confirmBrushing,
    addEntry,
    updateEntry,
    deleteEntry,

    // Utilities
    getEntryByDate,
    getEntriesInRange,
    refreshData,

    // Loading state
    isLoading,
  };
}

// Hook for getting weekly chart data
export function useWeeklyStats(weeks = 12) {
  const [weeklyData, setWeeklyData] = useState<
    Array<{ week: string; brushed: number; total: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWeeklyData = () => {
      try {
        setIsLoading(true);
        const data = BrushingAnalytics.getWeeklyData(weeks);
        setWeeklyData(data);
      } catch (error) {
        console.error("Error loading weekly stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWeeklyData();

    // Refresh every hour
    const interval = setInterval(loadWeeklyData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [weeks]);

  return { weeklyData, isLoading };
}

// Hook for calendar grid data
export function useCalendarData(year: number, month: number) {
  const { entries } = useBrushingData();

  const calendarData = useState(() => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const daysInMonth = endDate.getDate();

    const monthData: Array<{
      date: string;
      day: number;
      isBrushed: boolean;
      entry?: BrushingEntry;
    }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const entry = entries.find((e) => e.date === dateStr);

      monthData.push({
        date: dateStr,
        day,
        isBrushed: entry?.confirmed || false,
        entry,
      });
    }

    return monthData;
  })[0];

  return calendarData;
}
