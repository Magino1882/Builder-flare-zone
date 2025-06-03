import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Smile,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { BrushingEntry } from "@/components/calendar/BrushingEntry";
import { ReminderSystem } from "@/components/notifications/ReminderSystem";
import { cn } from "@/lib/utils";
import { useBrushingData } from "@/hooks/useBrushingData";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const {
    entries,
    hasBrushedToday,
    confirmBrushing,
    stats,
    getEntryByDate,
    deleteEntry,
  } = useBrushingData();

  const selectedEntry = selectedDate ? getEntryByDate(selectedDate) : null;
  const recentEntries = entries
    .filter((entry) => entry.confirmed)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  const handleDateSelect = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
  };

  const handleDeleteEntry = (entry: any) => {
    deleteEntry(entry.id);
    if (selectedDate === entry.date) {
      setSelectedDate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation title="Kalender" />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">🦷</span>
            Zahnputz-Kalender
          </h1>
          <p className="text-lg text-gray-600">
            Behalte den Überblick über deine tägliche Zahnhygiene
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Aktuelle Serie</p>
                  <p className="text-3xl font-bold">{stats.currentStreak}</p>
                  <p className="text-blue-100 text-xs">
                    aufeinanderfolgende Tage
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Geputzte Tage</p>
                  <p className="text-3xl font-bold">{stats.brushedDays}</p>
                  <p className="text-green-100 text-xs">
                    von {stats.totalDays} Tagen
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Wochenfortschritt</p>
                  <p className="text-3xl font-bold">
                    {stats.averagePerWeek.toFixed(1)}
                  </p>
                  <p className="text-purple-100 text-xs">Tage pro Woche</p>
                </div>
                <Smile className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card
            className={cn(
              "border-2",
              hasBrushedToday
                ? "border-green-200 bg-green-50"
                : "border-blue-200 bg-blue-50",
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {hasBrushedToday ? "✅" : "🕐"}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {hasBrushedToday
                        ? "Gut gemacht!"
                        : "Heute noch nicht geputzt"}
                    </h3>
                    <p className="text-gray-600">
                      {hasBrushedToday
                        ? "Du hast heute bereits deine Zähne geputzt."
                        : "Vergiss nicht, deine Zähne zu putzen."}
                    </p>
                  </div>
                </div>

                {!hasBrushedToday && (
                  <Button
                    onClick={confirmBrushing}
                    size="lg"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Zähne geputzt ✓
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <CalendarGrid
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate || undefined}
            />

            {/* Selected Date Details */}
            {selectedEntry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Ausgewählter Tag
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BrushingEntry
                      entry={selectedEntry}
                      onDelete={handleDeleteEntry}
                      showActions={true}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Reminder System */}
            <ReminderSystem />

            {/* Recent Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                  Letzte Einträge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentEntries.length > 0 ? (
                    recentEntries.map((entry) => (
                      <BrushingEntry
                        key={entry.id}
                        entry={entry}
                        compact={true}
                        showActions={false}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Noch keine Einträge vorhanden
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🌟</div>
                  <h3 className="font-semibold mb-2">Motivations-Tipp</h3>
                  <p className="text-sm text-yellow-100">
                    {stats.currentStreak === 0
                      ? "Jeder Neuanfang ist eine Chance! Starte heute deine Serie."
                      : stats.currentStreak < 7
                        ? `Klasse! Noch ${7 - stats.currentStreak} Tage bis zur Woche.`
                        : "Fantastisch! Du bist auf einem großartigen Weg!"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
