import { motion } from "framer-motion";
import {
  TrendingUp,
  Calendar,
  Flame,
  Target,
  Award,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";
import { useBrushingData, useWeeklyStats } from "@/hooks/useBrushingData";

interface StatsDashboardProps {
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: "blue" | "green" | "orange" | "purple";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-500 text-blue-50",
    green: "bg-green-500 text-green-50",
    orange: "bg-orange-500 text-orange-50",
    purple: "bg-purple-500 text-purple-50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && (
                  <Badge
                    variant={trend.isPositive ? "default" : "secondary"}
                    className={cn(
                      "text-xs",
                      trend.isPositive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    {trend.isPositive ? "+" : ""}
                    {trend.value}%
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl",
                colorClasses[color],
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StatsDashboard({ className }: StatsDashboardProps) {
  const { stats } = useBrushingData();
  const { weeklyData, isLoading } = useWeeklyStats(12);

  // Calculate completion rate
  const completionRate =
    stats.totalDays > 0
      ? Math.round((stats.brushedDays / stats.totalDays) * 100)
      : 0;

  // Calculate weekly goal progress (assuming goal is to brush every day)
  const currentWeekProgress =
    stats.averagePerWeek > 0
      ? Math.min(Math.round((stats.averagePerWeek / 7) * 100), 100)
      : 0;

  // Prepare chart data
  const chartData = weeklyData.map((week) => ({
    ...week,
    percentage: Math.round((week.brushed / week.total) * 100),
  }));

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Geputzte Tage"
          value={stats.brushedDays}
          subtitle={`von ${stats.totalDays} Tagen`}
          icon={Calendar}
          color="blue"
        />

        <StatCard
          title="Aktuelle Serie"
          value={stats.currentStreak}
          subtitle="aufeinanderfolgende Tage"
          icon={Flame}
          color="orange"
        />

        <StatCard
          title="Längste Serie"
          value={stats.longestStreak}
          subtitle="persönlicher Rekord"
          icon={Award}
          color="purple"
        />

        <StatCard
          title="Wochenfortschritt"
          value={`${stats.averagePerWeek}/7`}
          subtitle="Tage pro Woche"
          icon={Target}
          color="green"
        />
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Gesamtfortschritt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Abschlussrate</span>
                <span className="text-2xl font-bold text-blue-600">
                  {completionRate}%
                </span>
              </div>
              <Progress value={completionRate} className="h-3" />
              <p className="text-sm text-gray-600">
                Du hast an {stats.brushedDays} von {stats.totalDays} verfolgten
                Tagen deine Zähne geputzt.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Wochenziel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Diese Woche</span>
                <span className="text-2xl font-bold text-green-600">
                  {currentWeekProgress}%
                </span>
              </div>
              <Progress value={currentWeekProgress} className="h-3" />
              <p className="text-sm text-gray-600">
                Durchschnittlich {stats.averagePerWeek} Tage pro Woche in den
                letzten 30 Tagen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Wochenverlauf (letzte 12 Wochen)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 7]}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} ${name === "brushed" ? "Tage geputzt" : "Tage total"}`,
                      "",
                    ]}
                    labelFormatter={(label) => `Woche vom ${label}`}
                  />
                  <Bar
                    dataKey="brushed"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="brushed"
                  />
                  <Bar
                    dataKey="total"
                    fill="#e5e7eb"
                    radius={[4, 4, 0, 0]}
                    name="total"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Percentage Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Prozentualer Fortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Abschlussrate"]}
                    labelFormatter={(label) => `Woche vom ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Errungenschaften
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* First Brush */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg border-2 text-center",
                stats.brushedDays >= 1
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50",
              )}
            >
              <div className="text-2xl mb-2">🏁</div>
              <div className="text-sm font-medium">Erster Eintrag</div>
            </motion.div>

            {/* Week Streak */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg border-2 text-center",
                stats.longestStreak >= 7
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50",
              )}
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="text-sm font-medium">7 Tage Serie</div>
            </motion.div>

            {/* Month Streak */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg border-2 text-center",
                stats.longestStreak >= 30
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50",
              )}
            >
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm font-medium">30 Tage Serie</div>
            </motion.div>

            {/* Perfectionist */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg border-2 text-center",
                completionRate >= 90
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50",
              )}
            >
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-sm font-medium">90% Rate</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
