import React, { useState } from "react";
import { LeftSidebar } from "./LeftSidebar";

interface AppShellLayoutProps {
  children: React.ReactNode;
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("weekly");

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50 overflow-hidden">
      {/* Left Sidebar */}
      <LeftSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pl-[60px] md:pl-0">
        {/* We wrap children in a scrollable container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

