import { motion } from "framer-motion";
import {
  Calendar,
  BarChart3,
  Settings,
  CheckCircle2,
  Clock,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useBrushingData } from "@/hooks/useBrushingData";
import { ReminderSystem } from "@/components/notifications/ReminderSystem";

const Index = () => {
  const navigate = useNavigate();
  const { hasBrushedToday, confirmBrushing, stats } = useBrushingData();

  const menuItems = [
    {
      title: "Kalender",
      description: "Verfolge deine tägliche Zahnhygiene",
      icon: Calendar,
      color: "blue",
      path: "/calendar",
    },
    {
      title: "Statistiken",
      description: "Detaillierte Auswertungen und Trends",
      icon: BarChart3,
      color: "purple",
      path: "/statistics",
    },
    {
      title: "Einstellungen",
      description: "Erinnerungen und Benachrichtigungen",
      icon: Settings,
      color: "gray",
      path: "/settings",
    },
  ];

  const handleQuickAction = () => {
    if (hasBrushedToday) {
      navigate("/calendar");
    } else {
      confirmBrushing();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-4">
            <span className="text-6xl">🦷</span>
            Zahnputz-Kalender
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Behalte den Überblick über deine tägliche Zahnhygiene und entwickle
            gesunde Gewohnheiten
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Aktuelle Serie</p>
                  <p className="text-3xl font-bold">{stats.currentStreak}</p>
                  <p className="text-blue-100 text-xs">
                    aufeinanderfolgende Tage
                  </p>
                </div>
                <Flame className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">Geputzte Tage</p>
                  <p className="text-3xl font-bold">{stats.brushedDays}</p>
                  <p className="text-green-100 text-xs">
                    von {stats.totalDays} Tagen
                  </p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Pro Woche</p>
                  <p className="text-3xl font-bold">
                    {stats.averagePerWeek.toFixed(1)}
                  </p>
                  <p className="text-purple-100 text-xs">
                    Tage durchschnittlich
                  </p>
                </div>
                <Clock className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card
            className={cn(
              "border-2 transition-all duration-300",
              hasBrushedToday
                ? "border-green-200 bg-green-50 shadow-lg"
                : "border-orange-200 bg-orange-50 shadow-lg",
            )}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-6xl">
                    {hasBrushedToday ? "✅" : "🕐"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {hasBrushedToday ? "Perfekt!" : "Bereit zum Putzen?"}
                    </h2>
                    <p className="text-lg text-gray-700">
                      {hasBrushedToday
                        ? "Du hast heute bereits deine Zähne geputzt. Weiter so!"
                        : "Vergiss nicht, deine Zähne zu putzen für eine gesunde Mundhygiene."}
                    </p>
                    {hasBrushedToday && (
                      <Badge className="mt-2 bg-green-500">
                        Heute erledigt ✓
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleQuickAction}
                  size="lg"
                  className={cn(
                    "h-14 px-8 text-lg font-semibold",
                    hasBrushedToday
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-green-500 hover:bg-green-600",
                  )}
                >
                  {hasBrushedToday ? "Zum Kalender" : "Zähne geputzt ✓"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Navigation Menu */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card
                        className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-gray-300"
                        onClick={() => navigate(item.path)}
                      >
                        <CardContent className="p-6 text-center">
                          <div
                            className={cn(
                              "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
                              item.color === "blue" &&
                                "bg-blue-100 text-blue-600",
                              item.color === "purple" &&
                                "bg-purple-100 text-purple-600",
                              item.color === "gray" &&
                                "bg-gray-100 text-gray-600",
                            )}
                          >
                            <item.icon className="h-8 w-8" />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reminder System */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ReminderSystem />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
