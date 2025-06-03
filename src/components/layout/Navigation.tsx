import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface NavigationProps {
  title?: string;
  showBackButton?: boolean;
}

export function Navigation({ title, showBackButton = true }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show navigation on the home page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 mb-6"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Button>
            )}

            {title && (
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Startseite
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
