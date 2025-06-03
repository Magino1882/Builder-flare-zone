import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsDashboard } from "@/components/statistics/StatsDashboard";
import { BrushingEntry } from "@/components/calendar/BrushingEntry";
import { Navigation } from "@/components/layout/Navigation";
import { toast } from "sonner";
import { useBrushingData } from "@/hooks/useBrushingData";

export default function Statistics() {
  const { entries, stats, deleteEntry } = useBrushingData();

  const confirmedEntries = entries
    .filter((entry) => entry.confirmed)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const handleExportData = () => {
    try {
      const dataToExport = {
        exportDate: new Date().toISOString(),
        statistics: stats,
        entries: entries,
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `zahnputz-kalender-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Daten erfolgreich exportiert");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Fehler beim Exportieren der Daten");
    }
  };

  const handleShareStats = async () => {
    const shareText = `Meine Zahnputz-Statistiken:
🦷 ${stats.brushedDays} Tage geputzt
🔥 ${stats.currentStreak} aktuelle Serie
🏆 ${stats.longestStreak} längste Serie
📊 ${stats.averagePerWeek.toFixed(1)} Tage/Woche

Verfolge deine Zahnhygiene auch mit dem Zahnputz-Kalender!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meine Zahnputz-Statistiken",
          text: shareText,
        });
        toast.success("Statistiken geteilt");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Text in Zwischenablage kopiert");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        toast.error("Fehler beim Kopieren");
      }
    }
  };

  const handleDeleteEntry = (entry: any) => {
    deleteEntry(entry.id);
    toast.success("Eintrag gelöscht");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navigation title="Statistiken" />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <BarChart3 className="h-10 w-10 text-purple-600" />
              Statistiken
            </h1>
            <p className="text-lg text-gray-600">
              Detaillierte Auswertung deiner Zahnhygiene
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleShareStats}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Teilen
            </Button>
            <Button
              variant="outline"
              onClick={handleExportData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Statistics Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Übersicht
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Verlauf
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Erkenntnisse
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <StatsDashboard />
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Verlauf aller Einträge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {confirmedEntries.length > 0 ? (
                      confirmedEntries.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <BrushingEntry
                            entry={entry}
                            onDelete={handleDeleteEntry}
                            showActions={true}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Noch keine Daten
                        </h3>
                        <p className="text-gray-600">
                          Beginne heute mit dem Verfolgen deiner Zahnhygiene!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              {/* Insights Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Best Day Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>📅 Beste Wochentage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const dayNames = [
                          "Sonntag",
                          "Montag",
                          "Dienstag",
                          "Mittwoch",
                          "Donnerstag",
                          "Freitag",
                          "Samstag",
                        ];
                        const dayCounts = new Array(7).fill(0);

                        confirmedEntries.forEach((entry) => {
                          const day = new Date(entry.date).getDay();
                          dayCounts[day]++;
                        });

                        const dayData = dayNames
                          .map((name, index) => ({
                            day: name,
                            count: dayCounts[index],
                            percentage:
                              confirmedEntries.length > 0
                                ? Math.round(
                                    (dayCounts[index] /
                                      confirmedEntries.length) *
                                      100,
                                  )
                                : 0,
                          }))
                          .sort((a, b) => b.count - a.count);

                        return dayData.slice(0, 3).map((item, index) => (
                          <div
                            key={item.day}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm font-medium">
                              {index + 1}. {item.day}
                            </span>
                            <span className="text-sm text-gray-600">
                              {item.count} mal ({item.percentage}%)
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>📊 Monatlicher Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const monthNames = [
                          "Jan",
                          "Feb",
                          "Mär",
                          "Apr",
                          "Mai",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Okt",
                          "Nov",
                          "Dez",
                        ];
                        const monthCounts = new Array(12).fill(0);

                        confirmedEntries.forEach((entry) => {
                          const month = new Date(entry.date).getMonth();
                          monthCounts[month]++;
                        });

                        const monthData = monthNames
                          .map((name, index) => ({
                            month: name,
                            count: monthCounts[index],
                          }))
                          .filter((item) => item.count > 0)
                          .sort((a, b) => b.count - a.count);

                        return monthData.slice(0, 3).map((item, index) => (
                          <div
                            key={item.month}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm font-medium">
                              {index + 1}. {item.month}
                            </span>
                            <span className="text-sm text-gray-600">
                              {item.count} Tage
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Streak Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>🔥 Serien-Analyse</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
                        <span className="font-medium">Aktuelle Serie</span>
                        <span className="text-xl font-bold text-orange-600">
                          {stats.currentStreak} Tage
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                        <span className="font-medium">Längste Serie</span>
                        <span className="text-xl font-bold text-purple-600">
                          {stats.longestStreak} Tage
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {stats.currentStreak === stats.longestStreak &&
                        stats.currentStreak > 0
                          ? "🎉 Du bist gerade auf deinem Allzeit-Rekord!"
                          : stats.currentStreak > 0
                            ? `Noch ${stats.longestStreak - stats.currentStreak} Tage bis zum Rekord!`
                            : "Starte eine neue Serie!"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Goals Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>🎯 Ziele & Fortschritt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>7-Tage Serie</span>
                          <span
                            className={
                              stats.longestStreak >= 7
                                ? "text-green-600"
                                : "text-gray-600"
                            }
                          >
                            {stats.longestStreak >= 7
                              ? "✅"
                              : `${Math.max(0, 7 - stats.currentStreak)} Tage fehlen`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>30-Tage Serie</span>
                          <span
                            className={
                              stats.longestStreak >= 30
                                ? "text-green-600"
                                : "text-gray-600"
                            }
                          >
                            {stats.longestStreak >= 30
                              ? "✅"
                              : `${Math.max(0, 30 - stats.currentStreak)} Tage fehlen`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>90% Erfolgsrate</span>
                          <span
                            className={
                              stats.totalDays > 0 &&
                              stats.brushedDays / stats.totalDays >= 0.9
                                ? "text-green-600"
                                : "text-gray-600"
                            }
                          >
                            {stats.totalDays > 0 &&
                            stats.brushedDays / stats.totalDays >= 0.9
                              ? "✅"
                              : `${Math.round((stats.brushedDays / Math.max(1, stats.totalDays)) * 100)}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
