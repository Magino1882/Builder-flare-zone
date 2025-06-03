import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Volume2,
  Bell,
  Clock,
  Save,
  TestTube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useReminders } from "@/hooks/useReminders";
import { audioManager, AVAILABLE_SOUNDS, SoundType } from "@/lib/audio";

interface SettingsFormProps {
  className?: string;
}

export function SettingsForm({ className }: SettingsFormProps) {
  const {
    settings,
    updateSettings,
    hasNotificationPermission,
    requestPermission,
  } = useReminders();

  const [newReminderTime, setNewReminderTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSound, setIsTestingSound] = useState<string | null>(null);

  const handleAddReminderTime = () => {
    if (!newReminderTime) return;

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newReminderTime)) {
      toast.error("Bitte gib eine gültige Zeit im Format HH:MM ein");
      return;
    }

    // Check if time already exists
    if (settings.reminderTimes.includes(newReminderTime)) {
      toast.error("Diese Erinnerungszeit existiert bereits");
      return;
    }

    const updatedTimes = [...settings.reminderTimes, newReminderTime].sort();
    updateSettings({ reminderTimes: updatedTimes });
    setNewReminderTime("");
    toast.success("Erinnerungszeit hinzugefügt");
  };

  const handleRemoveReminderTime = (timeToRemove: string) => {
    const updatedTimes = settings.reminderTimes.filter(
      (time) => time !== timeToRemove,
    );
    updateSettings({ reminderTimes: updatedTimes });
    toast.success("Erinnerungszeit entfernt");
  };

  const handleVolumeChange = (volume: number[]) => {
    updateSettings({ volume: volume[0] });
  };

  const handleSoundChange = (sound: string) => {
    updateSettings({ selectedSound: sound });
  };

  const handleTestSound = async (soundType: SoundType) => {
    if (isTestingSound) return;

    setIsTestingSound(soundType);
    try {
      await audioManager.testSound(soundType);
    } catch (error) {
      console.error("Error testing sound:", error);
      toast.error("Fehler beim Abspielen des Sounds");
    } finally {
      setIsTestingSound(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Settings are already saved via updateSettings
      toast.success("Einstellungen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern der Einstellungen");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Benachrichtigungen aktiviert");
    } else {
      toast.error("Benachrichtigungen wurden nicht aktiviert");
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Notification Permission */}
      {!hasNotificationPermission && (
        <Alert className="border-amber-200 bg-amber-50">
          <Bell className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-amber-800">
              Benachrichtigungen sind deaktiviert. Aktiviere sie für
              Erinnerungen.
            </span>
            <Button
              size="sm"
              onClick={handleRequestNotifications}
              className="ml-4"
            >
              Aktivieren
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Reminder Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Erinnerungszeiten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current reminder times */}
          <div className="space-y-2">
            <Label>Aktuelle Erinnerungen</Label>
            <div className="flex flex-wrap gap-2">
              {settings.reminderTimes.map((time) => (
                <motion.div
                  key={time}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <Badge variant="secondary" className="px-3 py-1">
                    {time}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveReminderTime(time)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
              {settings.reminderTimes.length === 0 && (
                <span className="text-sm text-gray-500">
                  Keine Erinnerungen konfiguriert
                </span>
              )}
            </div>
          </div>

          {/* Add new reminder time */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-reminder">Neue Erinnerungszeit</Label>
              <Input
                id="new-reminder"
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                placeholder="HH:MM"
              />
            </div>
            <Button
              onClick={handleAddReminderTime}
              disabled={!newReminderTime}
              className="mt-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-green-500" />
            Sound-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sound enabled toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sound aktiviert</Label>
              <p className="text-sm text-gray-500">
                Spielt Töne bei Erinnerungen ab
              </p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(enabled) =>
                updateSettings({ soundEnabled: enabled })
              }
            />
          </div>

          {/* Volume slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Lautstärke</Label>
              <span className="text-sm text-gray-500">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={handleVolumeChange}
              max={1}
              min={0}
              step={0.1}
              disabled={!settings.soundEnabled}
              className="w-full"
            />
          </div>

          {/* Sound selection */}
          <div className="space-y-2">
            <Label>Sound auswählen</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(AVAILABLE_SOUNDS).map(([key, sound]) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      settings.selectedSound === key
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-gray-300",
                    )}
                    onClick={() => handleSoundChange(key)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {sound.displayName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestSound(key as SoundType);
                          }}
                          disabled={
                            isTestingSound === key || !settings.soundEnabled
                          }
                          className="h-8 w-8 p-0"
                        >
                          {isTestingSound === key ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                          ) : (
                            <TestTube className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alarm Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            Alarm-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Alarm-Verzögerung (Minuten)</Label>
            <p className="text-sm text-gray-500">
              Zeit bis zum Alarm, wenn Erinnerung nicht bestätigt wurde
            </p>
            <Select
              value={settings.alarmDelay.toString()}
              onValueChange={(value) =>
                updateSettings({ alarmDelay: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 Minuten</SelectItem>
                <SelectItem value="30">30 Minuten</SelectItem>
                <SelectItem value="45">45 Minuten</SelectItem>
                <SelectItem value="60">1 Stunde</SelectItem>
                <SelectItem value="90">1,5 Stunden</SelectItem>
                <SelectItem value="120">2 Stunden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
          size="lg"
        >
          {isSaving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Einstellungen speichern
        </Button>
      </motion.div>
    </div>
  );
}
