import {
  UserPlus,
  Calculator,
  History,
  BarChart3,
  Download,
  Upload,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    label: "Add Taxpayer",
    description: "Register individual or institution",
    icon: UserPlus,
    path: "/users/add",
    iconClass: "text-indigo-500",
    bgClass: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    label: "Compute Tax",
    description: "Prepare yearly tax computation",
    icon: Calculator,
    path: "/tax/compute",
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    label: "Tax History",
    description: "View previous tax computations",
    icon: History,
    path: "/tax/history",
    iconClass: "text-blue-500",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    label: "Tax Reports",
    description: "Top taxpayers and analytics",
    icon: BarChart3,
    path: "/reports",
    iconClass: "text-orange-500",
    bgClass: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    label: "Export Data",
    description: "Save system backup",
    icon: Download,
    path: "/backup",
    iconClass: "text-violet-500",
    bgClass: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    label: "Restore Data",
    description: "Restore previous backup",
    icon: Upload,
    path: "/backup",
    iconClass: "text-red-500",
    bgClass: "bg-red-50 dark:bg-red-950/30",
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Access common tax management operations
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: index * 0.05,
              }}
            >
              <Card
                className="
                  cursor-pointer
                  rounded-xl
                  border border-slate-200
                  bg-white
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-md
                  dark:border-gray-700
                  dark:bg-slate-900
                "
                onClick={() => navigate(action.path)}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div
                    className={`
                      flex h-14 w-14 shrink-0 items-center justify-center
                      rounded-xl
                      ${action.bgClass}
                    `}
                  >
                    <Icon
                      className={`h-6 w-6 ${action.iconClass}`}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">
                      {action.label}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
