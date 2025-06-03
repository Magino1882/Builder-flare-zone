import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBrushingData } from "@/hooks/useBrushingData";
import { BrushingEntry } from "@/lib/storage";

interface CalendarGridProps {
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
  className?: string;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isBrushed: boolean;
  entry?: BrushingEntry;
}

export function CalendarGrid({
  onDateSelect,
  selectedDate,
  className,
}: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { entries, hasBrushedToday, confirmBrushing } = useBrushingData();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split("T")[0];
      const entry = entries.find((e) => e.date === dateStr);

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: false,
        isBrushed: entry?.confirmed || false,
        entry,
      });
    }

    // Current month's days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const entry = entries.find((e) => e.date === dateStr);
      const isToday = date.toDateString() === today.toDateString();

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isToday,
        isBrushed: entry?.confirmed || false,
        entry,
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateStr = date.toISOString().split("T")[0];
      const entry = entries.find((e) => e.date === dateStr);

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: false,
        isBrushed: entry?.confirmed || false,
        entry,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  const handleDateClick = (calendarDay: CalendarDay) => {
    if (calendarDay.isToday && !calendarDay.isBrushed) {
      confirmBrushing();
    }
    onDateSelect?.(calendarDay.date);
  };

  const brushedDaysThisMonth = calendarDays.filter(
    (day) => day.isCurrentMonth && day.isBrushed,
  ).length;

  const totalDaysThisMonth = calendarDays.filter(
    (day) => day.isCurrentMonth,
  ).length;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              {brushedDaysThisMonth}/{totalDaysThisMonth} Tage
            </Badge>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Day names header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${year}-${month}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 gap-1"
          >
            {calendarDays.map((calendarDay, index) => (
              <motion.button
                key={`${calendarDay.date}-${index}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDateClick(calendarDay)}
                className={cn(
                  "h-12 flex items-center justify-center relative rounded-lg transition-all duration-200",
                  "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    // Current month styling
                    "text-gray-900 font-medium": calendarDay.isCurrentMonth,
                    "text-gray-400": !calendarDay.isCurrentMonth,

                    // Today styling
                    "bg-blue-50 border-2 border-blue-200": calendarDay.isToday,

                    // Selected date
                    "bg-blue-500 text-white": selectedDate === calendarDay.date,

                    // Brushed day styling
                    "bg-green-50 text-green-700":
                      calendarDay.isBrushed &&
                      !calendarDay.isToday &&
                      selectedDate !== calendarDay.date,
                  },
                )}
              >
                {/* Day number */}
                <span className="text-sm">{calendarDay.day}</span>

                {/* Brushed indicator */}
                {calendarDay.isBrushed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500 bg-white rounded-full" />
                  </motion.div>
                )}

                {/* Today indicator */}
                {calendarDay.isToday && !calendarDay.isBrushed && (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-1 -right-1"
                  >
                    <Circle className="h-4 w-4 text-blue-500 fill-blue-500" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Today's status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium text-gray-700">Heute</span>
            </div>

            <div className="flex items-center gap-2">
              {hasBrushedToday ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 text-green-600"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Erledigt!</span>
                </motion.div>
              ) : (
                <Button
                  size="sm"
                  onClick={confirmBrushing}
                  className="h-8 px-3 text-xs"
                >
                  Zähne geputzt ✓
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-100 border border-green-200" />
            <span>Geputzt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-100 border border-blue-200" />
            <span>Heute</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gray-100 border border-gray-200" />
            <span>Nicht geputzt</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
