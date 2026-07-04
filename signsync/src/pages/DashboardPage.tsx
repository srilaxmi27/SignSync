import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import StatusCard from "@/components/dashboard/StatusCard";
import CameraPanel from "@/components/dashboard/CameraPanel";
import GestureOutputPanel from "@/components/dashboard/GestureOutputPanel";
import ActivityHistory from "@/components/dashboard/ActivityHistory";
import { statusMetrics } from "@/data/dummyData";

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main id="overview" className="flex-1 px-6 py-8 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statusMetrics.map((metric) => (
              <StatusCard key={metric.id} metric={metric} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <CameraPanel />
            <GestureOutputPanel />
          </div>

          <div className="mt-6">
            <ActivityHistory />
          </div>
        </main>
      </div>
    </div>
  );
}
