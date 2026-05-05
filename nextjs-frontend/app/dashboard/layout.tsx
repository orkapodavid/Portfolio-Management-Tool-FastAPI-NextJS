import { TopNavigation } from "@/components/layout/top-navigation";
import { PerformanceHeader } from "@/components/layout/performance-header";
import { SubtabNavigation } from "@/components/layout/subtab-navigation";
import { NotificationSidebar } from "@/components/layout/notification-sidebar";
import { DashboardAuthGate } from "@/components/auth/dashboard-auth-gate";
import { NotificationsProvider } from "@/lib/notifications-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGate>
      <NotificationsProvider>
        <div className="flex flex-col h-screen bg-[#F0F0F0] text-gray-900 antialiased overflow-hidden">
          <TopNavigation />
          <PerformanceHeader />
          <div className="flex flex-1 overflow-hidden min-h-0 w-full">
            <div className="flex flex-col flex-1 min-h-0 h-full border-r border-gray-200 bg-white">
              <SubtabNavigation />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
            <NotificationSidebar />
          </div>
        </div>
      </NotificationsProvider>
    </DashboardAuthGate>
  );
}
