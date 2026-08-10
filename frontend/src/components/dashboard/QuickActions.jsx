import {
  UserPlus,
  Calculator,
  History,
  ChartNoAxesCombined,
  Download,
  Upload,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const actions = [
  {
    label: "Add Taxpayer",
    description: "Register individual or institution",
    icon: UserPlus,
    route: "/users/add",
    color:
      "bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF]",
  },

  {
    label: "Compute Tax",
    description: "Prepare yearly tax computation",
    icon: Calculator,
    route: "/tax/compute",
    color:
      "bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5]",
  },

  {
    label: "Tax History",
    description: "View previous tax computations",
    icon: History,
    route: "/users",
    color:
      "bg-[#EFF6FF] text-[#3B82F6] hover:bg-[#DBEAFE]",
  },

  {
    label: "Tax Reports",
    description: "Top taxpayers and analytics",
    icon: ChartNoAxesCombined,
    route: "/reports",
    color:
      "bg-[#FFF7ED] text-[#F59E0B] hover:bg-[#FFEDD5]",
  },

  {
    label: "Export Data",
    description: "Save system backup",
    icon: Download,
    route: "/backup",
    color:
      "bg-[#F5F3FF] text-[#7C3AED] hover:bg-[#EDE9FE]",
  },

  {
    label: "Restore Data",
    description: "Restore previous backup",
    icon: Upload,
    route: "/backup",
    color:
      "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]",
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="mt-6"
    >
      <div className="mb-4">
        <h2 className="text-base font-semibold">
          Quick Actions
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          Access common tax management operations
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <motion.button
              key={action.label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.route)}
              className="flex items-center gap-4 p-4 rounded-xl border border-[#E2E8F0] dark:border-gray-700 bg-white dark:bg-gray-800 text-left transition-all hover:shadow-sm"
            >
              <div
                className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${action.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {action.label}
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}