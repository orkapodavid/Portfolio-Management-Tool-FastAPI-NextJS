"use client";

import NavBar from "./nav-bar";

interface DemoLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function DemoLayout({ title, description, children }: DemoLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold text-ctp-text mb-1">{title}</h1>
        <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1">
          <span className="text-ctp-blue mt-0.5">i</span>
          <p className="text-sm text-ctp-subtext0">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
