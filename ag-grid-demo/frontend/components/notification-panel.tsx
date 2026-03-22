"use client";

import type { Notification } from "@/lib/types";

const LEVEL_COLORS: Record<string, string> = {
  warning: "bg-ctp-peach/20 text-ctp-peach border-ctp-peach/30",
  success: "bg-ctp-green/20 text-ctp-green border-ctp-green/30",
  error: "bg-ctp-red/20 text-ctp-red border-ctp-red/30",
  info: "bg-ctp-blue/20 text-ctp-blue border-ctp-blue/30",
};

interface NotificationPanelProps {
  notifications: Notification[];
  onClear: () => void;
  onJumpToRow: (rowId: string) => void;
}

export default function NotificationPanel({
  notifications,
  onClear,
  onJumpToRow,
}: NotificationPanelProps) {
  return (
    <div className="w-[300px] p-3 border border-ctp-surface1 rounded-lg bg-ctp-mantle">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ctp-text">Notifications</h3>
        <button
          onClick={onClear}
          className="text-xs px-2 py-1 rounded bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text transition-colors"
        >
          Clear
        </button>
      </div>
      {notifications.length === 0 ? (
        <p className="text-xs text-ctp-overlay0">No notifications</p>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-center gap-2 p-2 rounded bg-ctp-surface0/50"
            >
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  LEVEL_COLORS[n.level] || LEVEL_COLORS.info
                }`}
              >
                {n.level}
              </span>
              <span className="flex-1 text-xs text-ctp-text truncate">
                {n.message}
              </span>
              <button
                onClick={() => onJumpToRow(n.rowId)}
                className="text-ctp-blue hover:text-ctp-lavender text-sm"
                title="Jump to row"
              >
                &rarr;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
