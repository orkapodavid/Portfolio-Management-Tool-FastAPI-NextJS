"use client";

import { ArrowRight, BellOff, Check, CircleX, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  PENDING_HIGHLIGHT_STORAGE_KEY,
  useGridRegistry,
} from "@/lib/grid-registry";
import {
  getNotificationRowIdKey,
  slugifyNotificationRoute,
} from "@/lib/notification-routes";
import { cn } from "@/lib/utils";
import {
  type NotificationItem,
  type NotificationType,
  useNotifications,
} from "@/lib/notifications-context";

const TYPE_BG: Record<NotificationType, string> = {
  alert: "bg-[#FFC000]",
  warning: "bg-amber-200",
  info: "bg-blue-100",
};

const TYPE_BORDER: Record<NotificationType, string> = {
  alert: "border-black/20",
  warning: "border-amber-500",
  info: "border-blue-500",
};

function AlertCard({
  notification,
  onMarkRead,
  onDismiss,
  onGoToDetails,
}: {
  notification: NotificationItem;
  onMarkRead: () => void;
  onDismiss: () => void;
  onGoToDetails: () => void;
}) {
  const textColor =
    notification.type === "info" ? "text-blue-900" : "text-gray-900";
  const opacity = notification.read ? "opacity-60" : "opacity-100";

  return (
    <div
      className={cn(
        "p-3 rounded-md border-l-4 shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-right fade-in",
        TYPE_BG[notification.type],
        TYPE_BORDER[notification.type],
        opacity
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          {!notification.read && (
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5" />
          )}
          <h4
            className={cn(
              "text-[11px] font-black leading-tight uppercase tracking-wider",
              textColor
            )}
          >
            {notification.header}
          </h4>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
          className="text-gray-900/60 hover:text-black transition-colors"
        >
          <CircleX size={14} />
        </button>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black text-gray-900 bg-white/40 px-1.5 py-0.5 rounded border border-black/10">
          {notification.ticker}
        </span>
        <span className="text-[9px] font-bold text-gray-800/60">
          {notification.timestamp}
        </span>
      </div>
      <p className={cn("text-[10px] font-bold leading-snug", textColor)}>
        {notification.instruction}
      </p>
      <div className="flex gap-1 mt-2 pt-2 border-t border-black/10">
        <button
          type="button"
          title="Mark as read"
          onClick={onMarkRead}
          className="p-1 rounded hover:bg-white/60 text-gray-700 transition-colors"
        >
          <Check size={12} />
        </button>
        <button
          type="button"
          title="Go to details"
          onClick={onGoToDetails}
          className="p-1 rounded hover:bg-white/60 text-gray-700 transition-colors"
        >
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function FilterTab({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      key={value}
      type="button"
      onClick={onClick}
      className={cn(
        "px-2 py-1 rounded text-[8px] uppercase",
        active
          ? "bg-blue-600 text-white font-black shadow-sm"
          : "bg-gray-200 text-gray-600 font-bold hover:bg-gray-300 transition-colors"
      )}
    >
      {label}
    </button>
  );
}

export function NotificationSidebar() {
  const {
    notifications,
    unreadCount,
    isOpen,
    filter,
    isLoading,
    setFilter,
    markRead,
    dismiss,
  } = useNotifications();
  const router = useRouter();

  const visibleNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [filter, notifications]);

  const registry = useGridRegistry();
  const handleGoToDetails = (notification: NotificationItem) => {
    if (!notification.gridId || !notification.rowId) return;
    markRead(notification.id);

    const rowIdKey = getNotificationRowIdKey(notification.gridId);
    const jumped = registry?.jumpToRow(
      notification.gridId,
      notification.rowId,
      rowIdKey
    );
    if (jumped) return;

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        PENDING_HIGHLIGHT_STORAGE_KEY,
        JSON.stringify({
          gridId: notification.gridId,
          rowId: notification.rowId,
          rowIdKey,
        })
      );
    }

    router.push(slugifyNotificationRoute(notification));
  };

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 bg-[#F9F9F9] z-40 overflow-hidden transition-all duration-300 ease-in-out border-l border-gray-200",
        isOpen
          ? "w-[220px] md:static fixed inset-y-0 right-0 max-w-full shadow-2xl md:shadow-none opacity-100"
          : "w-0 opacity-0 border-l-0 pointer-events-none fixed inset-y-0 right-0 md:static md:relative"
      )}
    >
      <div className="h-full w-full flex flex-col min-w-[220px]">
        <div className="flex items-center justify-between mb-2 px-3 pt-3">
          <div className="flex items-center">
            <h3 className="text-[10px] font-black text-gray-500 tracking-widest">
              NOTIFICATIONS
            </h3>
            <span className="ml-2 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          </div>
        </div>
        <div className="flex gap-1 px-3 pb-2 border-b border-gray-200">
          <FilterTab
            label="All"
            value="all"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterTab
            label="Alerts"
            value="alert"
            active={filter === "alert"}
            onClick={() => setFilter("alert")}
          />
          <FilterTab
            label="Info"
            value="info"
            active={filter === "info"}
            onClick={() => setFilter("info")}
          />
        </div>
        <div className="flex-1 w-full overflow-y-auto">
          <div className="flex flex-col gap-2 p-2 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[9px]">Loading...</span>
              </div>
            ) : visibleNotifications.length > 0 ? (
              visibleNotifications.map((n) => (
                <AlertCard
                  key={n.id}
                  notification={n}
                  onMarkRead={() => markRead(n.id)}
                  onDismiss={() => dismiss(n.id)}
                  onGoToDetails={() => handleGoToDetails(n)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-60 py-8">
                <BellOff size={24} className="text-gray-300 mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  No active alerts
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center px-3 py-2 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <span className="text-[9px] font-bold text-gray-500">
            Showing {visibleNotifications.length} of {notifications.length}
          </span>
        </div>
      </div>
    </aside>
  );
}
