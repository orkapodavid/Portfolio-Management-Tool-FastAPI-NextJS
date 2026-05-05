"use client";

import { Construction } from "lucide-react";

export default function ShortEclPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      <Construction size={48} className="text-gray-300 mb-4" />
      <h1 className="text-sm font-black text-gray-600 uppercase tracking-widest">
        Short ECL
      </h1>
      <p className="mt-2 max-w-md text-center text-[11px] font-medium text-gray-500">
        Mirrors reflex short_ecl_ag_grid.py. Awaits the
        <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded text-[10px]">
          GET /api/portfolio-tools/short-ecl
        </code>
        endpoint (§8 in the handoff brief).
      </p>
    </div>
  );
}
