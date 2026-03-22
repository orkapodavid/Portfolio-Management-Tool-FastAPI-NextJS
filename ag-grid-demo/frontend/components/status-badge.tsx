"use client";

interface StatusBadgeProps {
  lastEvent: string;
}

export default function StatusBadge({ lastEvent }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-ctp-blue/20 text-ctp-blue border border-ctp-blue/30">
      {lastEvent}
    </span>
  );
}
