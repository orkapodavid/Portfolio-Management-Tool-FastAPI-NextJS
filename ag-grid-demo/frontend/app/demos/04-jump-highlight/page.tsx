"use client";

import { useRouter } from "next/navigation";
import DemoLayout from "@/components/demo-layout";

const JUMP_TARGETS = [
  { label: "Jump to AAPL", rowId: "0", bgClass: "bg-ctp-blue/20", textClass: "text-ctp-blue", borderClass: "border-ctp-blue/30", hoverClass: "hover:bg-ctp-blue/30" },
  { label: "Jump to GOOGL", rowId: "1", bgClass: "bg-ctp-green/20", textClass: "text-ctp-green", borderClass: "border-ctp-green/30", hoverClass: "hover:bg-ctp-green/30" },
  { label: "Jump to MSFT", rowId: "2", bgClass: "bg-ctp-peach/20", textClass: "text-ctp-peach", borderClass: "border-ctp-peach/30", hoverClass: "hover:bg-ctp-peach/30" },
  { label: "Jump to XOM", rowId: "7", bgClass: "bg-ctp-mauve/20", textClass: "text-ctp-mauve", borderClass: "border-ctp-mauve/30", hoverClass: "hover:bg-ctp-mauve/30" },
];

export default function Demo04Page() {
  const router = useRouter();

  return (
    <DemoLayout
      title="04 - Jump & Highlight"
      description="Navigate to the WebSocket demo and automatically scroll to and highlight a specific row. Click any button below to jump to a stock in the live-updating grid."
    >
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <p className="text-ctp-subtext0 text-sm mb-4">
          Select a stock to navigate to the WebSocket demo and highlight that row:
        </p>

        <div className="grid grid-cols-2 gap-4">
          {JUMP_TARGETS.map((target) => (
            <button
              key={target.rowId}
              onClick={() =>
                router.push(`/demos/10-websocket?highlight=${target.rowId}`)
              }
              className={`px-8 py-4 rounded-lg ${target.bgClass} ${target.textClass} border ${target.borderClass} text-base font-semibold ${target.hoverClass} transition-colors`}
            >
              {target.label}
            </button>
          ))}
        </div>
      </div>
    </DemoLayout>
  );
}
