"use client";

import { Construction } from "lucide-react";

export default function PricerWarrantPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      <Construction size={48} className="text-gray-300 mb-4" />
      <h1 className="text-sm font-black text-gray-600 uppercase tracking-widest">
        Pricer · Warrant
      </h1>
      <p className="mt-2 max-w-md text-center text-[11px] font-medium text-gray-500">
        Form-based warrant pricer scaffold. The reflex reference at
        <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded text-[10px]">
          components/risk/pricer_warrant_view.py
        </code>
        ships a 21-field Terms / Simulations / Outputs / chart layout backed by
        <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded text-[10px]">
          PricerWarrantState
        </code>
        ; that port is queued behind the AG Grid module convergences.
      </p>
    </div>
  );
}
