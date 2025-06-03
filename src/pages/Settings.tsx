import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Info,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { toast } from "sonner";
import { BrushingStorage, SettingsStorage } from "@/lib/storage";
import { useBrushingData } from "@/hooks/useBrushingData";

export default function Settings() {
  const { entries, refreshData } = useBrushingData();

  const handleResetSettings = () => {
    try {
      SettingsStorage.resetSettings();
      toast.success("Einstellungen zurückgesetzt");
      // Refresh the page to reload default settings
      window.location.reload();
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast.error("Fehler beim Zurücksetzen der Einstellungen");
    }
  };

  const handleClearAllData = () => {
    try {
      BrushingStorage.clearAllEntries();
      SettingsStorage.resetSettings();
      refreshData();
      toast.success("Alle Daten gelöscht");
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error("Fehler beim Löschen der Daten");
    }
  };

  const handleExportData = () => {
    try {
      const data = {
        entries: BrushingStorage.getAllEntries(),
        settings: SettingsStorage.getSettings(),
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `zahnputz-kalender-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Backup erstellt");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Fehler beim Erstellen des Backups");
    }
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          // Validate data structure
          if (!data.entries || !data.settings) {
            throw new Error("Invalid backup file format");
          }

          // Import entries
          BrushingStorage.clearAllEntries();
          data.entries.forEach((entry: any) => {
            BrushingStorage.insertEntry({
              date: entry.date,
              timestamp: entry.timestamp,
              confirmed: entry.confirmed,
              reminderTime: entry.reminderTime,
            });
          });

          // Import settings
          SettingsStorage.resetSettings();
          SettingsStorage.updateSettings(data.settings);

          refreshData();
          toast.success("Backup wiederhergestellt");
        } catch (error) {
          console.error("Error importing data:", error);
          toast.error("Fehler beim Wiederherstellen des Backups");
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  const dataStorageSize = (() => {
    try {
      const entriesData = JSON.stringify(BrushingStorage.getAllEntries());
      const settingsData = JSON.stringify(SettingsStorage.getSettings());
      return ((entriesData.length + settingsData.length) / 1024).toFixed(2);
    } catch {
      return "0";
    }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <SettingsIcon className="h-10 w-10 text-gray-600" />
            Einstellungen
          </h1>
          <p className="text-lg text-gray-600">
            Konfiguriere deinen Zahnputz-Kalender
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <SettingsForm />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Datenverwaltung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-2">
                    <span>Gespeicherte Einträge:</span>
                    <Badge variant="secondary">{entries.length}</Badge>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span>Speicherplatz:</span>
                    <Badge variant="secondary">{dataStorageSize} KB</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="w-full justify-start"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Backup erstellen
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleImportData}
                    className="w-full justify-start"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Backup wiederherstellen
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reset Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-orange-500" />
                  Zurücksetzen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Einstellungen zurücksetzen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Einstellungen zurücksetzen
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Alle Einstellungen werden auf die Standardwerte
                        zurückgesetzt. Deine Zahnputz-Daten bleiben erhalten.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetSettings}>
                        Zurücksetzen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Alle Daten löschen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Alle Daten löschen</AlertDialogTitle>
                      <AlertDialogDescription>
                        <strong>Achtung:</strong> Alle deine Zahnputz-Daten und
                        Einstellungen werden unwiderruflich gelöscht. Diese
                        Aktion kann nicht rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAllData}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Alle Daten löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Privacy Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Datenschutz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Alle deine Daten werden nur lokal in deinem Browser
                    gespeichert. Es werden keine Daten an externe Server
                    übertragen.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* App Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-gray-500" />
                  App-Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Entwickelt mit:</span>
                  <span>React + TypeScript</span>
                </div>
                <div className="flex justify-between">
                  <span>Speicher-Typ:</span>
                  <span>LocalStorage</span>
                </div>
                <div className="flex justify-between">
                  <span>Browser-Benachrichtigungen:</span>
                  <span>Unterstützt</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
