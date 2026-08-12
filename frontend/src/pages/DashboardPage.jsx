import { useEffect, useState } from "react";
import reportService from "../services/reportService";
import PageTransition from "../components/PageTransition";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsGrid from "../components/dashboard/StatsGrid";
import TaxCollectionChart from "../components/dashboard/TaxCollectionChart";
import UserDistribution from "../components/dashboard/UserDistribution";
import RecentTaxTable from "../components/dashboard/RecentTaxTable";
import TopTaxpayers from "../components/dashboard/TopTaxpayers";
import QuickActions from "../components/dashboard/QuickActions";
import { toast } from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const res = await reportService.getDashboard();
      setDashboard(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* ================= HEADER ================= */}
        <div className="flex items-start justify-between gap-4">
          <DashboardHeader />

          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            disabled={loading}
            className="gap-2 shrink-0"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>

        {/* ================= STATS ================= */}
        <StatsGrid
          dashboard={dashboard}
          loading={loading}
        />

        {/* ================= CHARTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TaxCollectionChart />
          </div>

          <UserDistribution
            dashboard={dashboard}
          />
        </div>

        {/* ================= RECENT + TOP TAXPAYERS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            <RecentTaxTable />

            <QuickActions />

          </div>

          {/* RIGHT COLUMN */}
          <div>
            <TopTaxpayers />
          </div>

        </div>

      </div>
    </PageTransition>
  );
}