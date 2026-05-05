import { TopNavigation } from "@/components/layout/top-navigation";
import { PerformanceHeader } from "@/components/layout/performance-header";
import { SubtabNavigation } from "@/components/layout/subtab-navigation";
import { DashboardAuthGate } from "@/components/auth/dashboard-auth-gate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGate>
      <div className="flex flex-col h-screen bg-[#11111b] text-[#cdd6f4]">
        <TopNavigation />
        <PerformanceHeader />
        <SubtabNavigation />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </DashboardAuthGate>
  );
}
