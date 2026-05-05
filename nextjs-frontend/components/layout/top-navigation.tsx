"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { COLORS, LAYOUT, MODULES } from "@/lib/constants";
import { logout } from "@/components/actions/logout-action";
import { useNotifications } from "@/lib/notifications-context";
import {
  Activity,
  BarChart2,
  Bell,
  Briefcase,
  Calendar,
  DollarSign,
  FileCheck2,
  Layers,
  Scale,
  Settings,
  ShieldAlert,
  ShoppingCart,
  User,
  Wrench,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  BarChart2,
  Briefcase,
  DollarSign,
  ShieldAlert,
  FileCheck2,
  Scale,
  Wrench,
  Layers,
  Calendar,
  Settings,
  ShoppingCart,
};

export function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggleOpen, unreadCount } = useNotifications();

  const activeModuleId = MODULES.find((m) =>
    pathname.startsWith(`/dashboard/${m.id}`)
  )?.id;

  const handleLogout = async () => {
    const result = await logout();
    if (result?.redirectTo) {
      router.replace(result.redirectTo);
    }
  };

  return (
    <nav
      className="w-full shadow-md z-[60] shrink-0 flex items-center"
      style={{
        height: LAYOUT.NAV_HEIGHT,
        backgroundColor: COLORS.NAV_BG,
      }}
    >
      <Link
        href="/dashboard/market-data/market-data"
        className="flex items-center gap-2 mr-2 px-2 border-r border-gray-700 h-full shrink-0"
      >
        <Activity size={16} className="text-blue-400" />
        <span className="text-[10px] font-black text-white tracking-widest">
          PMT
        </span>
      </Link>

      <div className="hidden md:flex items-center h-full overflow-x-auto no-scrollbar gap-0 ml-2">
        {MODULES.map((mod) => {
          const Icon = iconMap[mod.icon];
          const isActive = activeModuleId === mod.id;
          const firstSubtab = mod.subtabs[0]?.id ?? "";
          return (
            <Link
              key={mod.id}
              href={`/dashboard/${mod.id}/${firstSubtab}`}
              className={cn(
                "h-full flex items-center px-2 border-b-2 relative",
                isActive
                  ? "border-blue-500 bg-white/10"
                  : "border-transparent hover:bg-white/5"
              )}
            >
              <div className="flex flex-row items-center gap-1.5 relative">
                {Icon && (
                  <Icon
                    size={LAYOUT.ICON_NAV_SIZE}
                    className={cn(isActive ? "text-white" : "text-gray-400")}
                  />
                )}
                <span
                  className={cn(
                    "text-[9px] uppercase",
                    isActive
                      ? "font-bold text-white"
                      : "font-medium text-gray-400 hover:text-gray-200"
                  )}
                >
                  {mod.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-500 animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-1 px-2 border-l border-gray-700 h-full shrink-0">
        <button
          type="button"
          aria-label="Notifications"
          onClick={toggleOpen}
          className={cn(
            "group p-1 rounded-md transition-all duration-200 relative",
            isOpen
              ? "bg-white/20 text-white"
              : "hover:bg-white/10"
          )}
        >
          <div className="relative">
            <Bell
              size={16}
              className={cn(
                isOpen ? "text-white" : "text-gray-400 group-hover:text-white"
              )}
            />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 text-[7px] font-black text-white animate-pulse"
                style={{ boxShadow: `0 0 0 1px ${COLORS.NAV_BG}` }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </button>
        <button
          type="button"
          title="Log out"
          onClick={() => {
            void handleLogout();
          }}
          className="p-1 rounded-md hover:bg-white/10 transition-all duration-200"
        >
          <User size={16} className="text-gray-400 hover:text-white" />
        </button>
      </div>
    </nav>
  );
}
