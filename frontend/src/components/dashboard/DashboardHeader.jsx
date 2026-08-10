import { format } from "date-fns";
import {
  CalendarDays,
  Calculator,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader() {
  const navigate = useNavigate();

  const today = format(new Date(), "dd MMM yyyy");

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold leading-tight">
            Tax Management Dashboard
          </h1>
        </div>

        <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">
          Manage taxpayers, compute annual tax, review history,
          and generate reports.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="gap-2 text-sm h-10 px-4"
        >
          <CalendarDays className="w-4 h-4" />
          {today}
        </Button>

        <Button
          onClick={() => navigate("/tax/compute")}
          className="gap-2 h-10"
        >
          <Calculator className="w-4 h-4" />
          Compute Tax
        </Button>
      </div>
    </div>
  );
}