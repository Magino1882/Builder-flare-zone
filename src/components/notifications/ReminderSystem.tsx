import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Clock,
  Check,
  X,
  Snooze,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useReminders } from "@/hooks/useReminders";
import { useBrushingData } from "@/hooks/useBrushingData";
import { audioManager } from "@/lib/audio";
import { formatTime } from "@/lib/timeFormat";

interface ReminderSystemProps {
  className?: string;
}

export function ReminderSystem({ className }: ReminderSystemProps) {
  const {
    settings,
    nextReminder,
    isReminderActive,
    isAlarmActive,
    hasNotificationPermission,
    requestPermission,
    snoozeReminder,
    dismissReminder,
  } = useReminders();

  const { confirmBrushing, hasBrushedToday } = useBrushingData();
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Show permission prompt if not granted
  useEffect(() => {
    if (!hasNotificationPermission && !showPermissionPrompt) {
      // Delay showing prompt to avoid immediate popup
      const timer = setTimeout(() => {
        setShowPermissionPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasNotificationPermission, showPermissionPrompt]);

  // Show reminder when it becomes active
  useEffect(() => {
    if (isReminderActive) {
      // Play audio independently for better reliability
      if (settings.soundEnabled) {
        audioManager
          .playReminder(settings.selectedSound as any)
          .catch(console.error);
      }
    }
  }, [isReminderActive, settings.soundEnabled, settings.selectedSound]);

  // Show alarm when it becomes active
  useEffect(() => {
    if (isAlarmActive) {
      // Play alarm sound
      if (settings.soundEnabled) {
        audioManager.playAlarm().catch(console.error);
      }
    }
  }, [isAlarmActive, settings.soundEnabled]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowPermissionPrompt(false);
    }
  };

  const handleConfirmBrushing = () => {
    confirmBrushing();
    dismissReminder();
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "--:--";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const time24 = `${hours}:${minutes}`;
    return formatTime(time24, settings.timeFormat);
  };

  const getTimeUntilNext = (date: Date | null) => {
    if (!date) return null;

    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return "Jetzt";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    }
    return `in ${minutes}m`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Permission Request */}
      <AnimatePresence>
        {showPermissionPrompt && !hasNotificationPermission && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert className="border-amber-200 bg-amber-50">
              <Bell className="h-4 w-4 text-amber-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-amber-800">
                  Aktiviere Benachrichtigungen für Zahnputz-Erinnerungen
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPermissionPrompt(false)}
                  >
                    Später
                  </Button>
                  <Button size="sm" onClick={handleRequestPermission}>
                    Aktivieren
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Reminder Alert */}
      <AnimatePresence>
        {(isReminderActive || isAlarmActive) && !hasBrushedToday && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative"
          >
            <Card
              className={cn(
                "border-2 shadow-lg",
                isAlarmActive
                  ? "border-red-300 bg-red-50"
                  : "border-blue-300 bg-blue-50",
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Bell
                      className={cn(
                        "h-8 w-8",
                        isAlarmActive ? "text-red-500" : "text-blue-500",
                      )}
                    />
                  </motion.div>

                  <div className="flex-1">
                    <h3
                      className={cn(
                        "text-lg font-semibold mb-1",
                        isAlarmActive ? "text-red-800" : "text-blue-800",
                      )}
                    >
                      {isAlarmActive
                        ? "⚠️ Wichtige Erinnerung!"
                        : "🦷 Zeit zum Zähne putzen!"}
                    </h3>
                    <p
                      className={cn(
                        "text-sm",
                        isAlarmActive ? "text-red-700" : "text-blue-700",
                      )}
                    >
                      {isAlarmActive
                        ? "Du hast das Zähneputzen noch nicht bestätigt. Bitte hole es nach!"
                        : "Es ist Zeit für deine tägliche Zahnhygiene."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleConfirmBrushing}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Erledigt
                    </Button>

                    {!isAlarmActive && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => snoozeReminder(5)}
                        >
                          5m
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => snoozeReminder(10)}
                        >
                          10m
                        </Button>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={dismissReminder}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminder Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold">Erinnerungen</h3>
            </div>

            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-green-500" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-400" />
              )}

              {hasNotificationPermission ? (
                <Bell className="h-4 w-4 text-green-500" />
              ) : (
                <BellOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Next Reminder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Nächste Erinnerung</span>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold">
                  {formatDateTime(nextReminder)}
                </div>
                <div className="text-xs text-gray-500">
                  {getTimeUntilNext(nextReminder)}
                </div>
              </div>
            </div>

            {/* Reminder Times */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Konfigurierte Zeiten:
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.reminderTimes.map((time, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {formatTime(time, settings.timeFormat)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    settings.soundEnabled ? "bg-green-500" : "bg-gray-300",
                  )}
                />
                <span
                  className={
                    settings.soundEnabled ? "text-green-700" : "text-gray-500"
                  }
                >
                  Sound {settings.soundEnabled ? "an" : "aus"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    hasNotificationPermission ? "bg-green-500" : "bg-gray-300",
                  )}
                />
                <span
                  className={
                    hasNotificationPermission
                      ? "text-green-700"
                      : "text-gray-500"
                  }
                >
                  Benachrichtigungen {hasNotificationPermission ? "an" : "aus"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
