import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { BrushingEntry as BrushingEntryType } from "@/lib/storage";

interface BrushingEntryProps {
  entry: BrushingEntryType;
  onToggle?: (entry: BrushingEntryType) => void;
  onDelete?: (entry: BrushingEntryType) => void;
  onEdit?: (entry: BrushingEntryType) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function BrushingEntry({
  entry,
  onToggle,
  onDelete,
  onEdit,
  showActions = true,
  compact = false,
  className,
}: BrushingEntryProps) {
  const entryDate = new Date(entry.date);
  const timestamp = new Date(entry.timestamp);
  const isToday = entryDate.toDateString() === new Date().toDateString();
  const isYesterday =
    new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString() ===
    entryDate.toDateString();

  const getDateLabel = () => {
    if (isToday) return "Heute";
    if (isYesterday) return "Gestern";
    return format(entryDate, "dd.MM.yyyy", { locale: de });
  };

  const getTimeLabel = () => {
    if (entry.confirmed) {
      return format(timestamp, "HH:mm", { locale: de });
    }
    return entry.reminderTime || "--:--";
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors",
          className,
        )}
      >
        <div className="flex-shrink-0">
          {entry.confirmed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-gray-300" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {getDateLabel()}
            </span>
            <span className="text-xs text-gray-500">{getTimeLabel()}</span>
          </div>
        </div>

        {entry.confirmed && (
          <Badge variant="secondary" className="text-xs">
            ✓
          </Badge>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={className}
    >
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow-md",
          entry.confirmed
            ? "border-green-200 bg-green-50/50"
            : "border-gray-200",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Status Icon */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              {entry.confirmed ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : (
                <button onClick={() => onToggle?.(entry)} className="group">
                  <Circle className="h-8 w-8 text-gray-300 group-hover:text-green-400 transition-colors" />
                </button>
              )}
            </motion.div>

            {/* Entry Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getDateLabel()}
                </h3>
                {isToday && (
                  <Badge variant="default" className="text-xs">
                    Heute
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {entry.confirmed
                      ? `Geputzt um ${getTimeLabel()}`
                      : `Erinnerung um ${getTimeLabel()}`}
                  </span>
                </div>

                {entry.confirmed && (
                  <Badge variant="secondary" className="text-xs">
                    Bestätigt
                  </Badge>
                )}
              </div>

              {/* Additional info for confirmed entries */}
              {entry.confirmed && (
                <div className="mt-2 text-xs text-gray-500">
                  Bestätigt am{" "}
                  {format(timestamp, "dd.MM.yyyy um HH:mm", { locale: de })} Uhr
                </div>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(entry)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eintrag löschen</AlertDialogTitle>
                        <AlertDialogDescription>
                          Möchtest du den Zahnputz-Eintrag vom {getDateLabel()}{" "}
                          wirklich löschen? Diese Aktion kann nicht rückgängig
                          gemacht werden.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(entry)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
