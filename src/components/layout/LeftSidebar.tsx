import React from "react";
import { motion } from "framer-motion";
import {
  IconLayoutSidebarLeftCollapse,
  IconCalendarWeek,
  IconTarget,
  IconCalendar,
} from "@tabler/icons-react";

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Custom Dawn and Dusk Logo (Half Sun / Half Moon)
const DawnDuskLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Sun half (left) */}
    <path d="M12 3v2" />
    <path d="M12 19v2" />
    <path d="M5.6 5.6l1.4 1.4" />
    <path d="M5.6 18.4l1.4 -1.4" />
    <path d="M3 12h2" />
    <path d="M12 16a4 4 0 0 1 0 -8" />
    {/* Moon half (right - stylized as crescent overlapping) */}
    <path d="M12 8a4 4 0 0 1 0 8 4 4 0 0 1 0 -8z" className="hidden" />{" "}
    {/* Hidden full circle ref */}
    <path d="M12 16a4 4 0 0 0 0 -8" />{" "}
    {/* Closing the sun half for visual consistency if needed, but let's do a crescent */}
    <path d="M16 12a4 4 0 0 1 -4 -4" />
    <path d="M12 16c2.5 0 4.5 -2 4.5 -4.5c0 -1.25 -.5 -2.4 -1.35 -3.25" />
    {/* Actually, let's make a simpler split icon */}
    {/* Clearer approach: Split circle. Left side rays. Right side smooth (moon-like). */}
  </svg>
);

const BetterDawnDuskLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Sun rays on left */}
    <path d="M12 3v1" />
    <path d="M12 20v1" />
    <path d="M5.6 5.6l.7 .7" />
    <path d="M5.6 18.4l.7 -.7" />
    <path d="M3 12h1" />

    {/* Central shape: Left half sun, Right half moon */}
    {/* Left half circle */}
    <path d="M12 17a5 5 0 0 1 0 -10" />

    {/* Right half moon - crescent shape */}
    <path d="M12 7c2.5 0 4.5 1.5 4.5 5s-2 5 -4.5 5" />
    {/* Maybe just a moon path on the right? */}
    <path
      d="M12 7a5 5 0 0 1 0 10"
      strokeDasharray="4 4"
      className="opacity-30"
    />
    <path d="M12 7c0 0 3 1 3 5s-3 5 -3 5" />
  </svg>
);

// Third attempt at a clean geometric logo:
// Circle split vertically. Left side has sun rays. Right side is dark (moon).
const FinalLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Sun Rays (Left side only) */}
    <path d="M3 12h2" />
    <path d="M4.9 4.9l1.4 1.4" />
    <path d="M4.9 19.1l1.4 -1.4" />
    <path d="M12 3v2" />
    <path d="M12 19v2" />

    {/* Main Circle Body */}
    <circle cx="12" cy="12" r="5" />

    {/* Divide visually - maybe fill the right side? or just lines? 
          Let's just do a path that represents the duality.
      */}
    <path d="M12 7v10" />
    <path d="M12 7c0 0 3 1 3 5s-3 5 -3 5" />
  </svg>
);
// Actually, simple is best. Sun on left, Moon on right.
const SimpleSunMoon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Sun (Left Top) */}
    <circle cx="8" cy="8" r="3" />
    <path d="M8 3v2" />
    <path d="M3 8h2" />
    <path d="M4.5 4.5l1 1" />

    {/* Moon (Right Bottom) */}
    <path d="M14.5 14.5a4 4 0 1 0 5 5 4 4 0 0 0 -5 -5z" />
  </svg>
);

// Let's go with a composed Sun/Moon split icon.
const SplitSunMoonLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Sun Left */}
    <path d="M12 5v-2" />
    <path d="M12 21v-2" />
    <path d="M5 12H3" />
    <path d="M7.05 7.05L5.64 5.64" />
    <path d="M7.05 16.95L5.64 18.36" />
    {/* Split Circle */}
    <path d="M12 8a4 4 0 0 0 0 8" /> {/* Left half of circle */}
    {/* Moon Right - solid crescent shape roughly */}
    <path d="M12 8c2.5 0 4 1.5 4 4s-1.5 4 -4 4" />
  </svg>
);

export function LeftSidebar({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
}: LeftSidebarProps) {
  const tabs = [
    { id: "weekly", label: "Weekly", icon: IconCalendarWeek },
    { id: "calendar", label: "Calendar", icon: IconCalendar },
    { id: "goals", label: "Goals", icon: IconTarget },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 260 : 60 }} // Rail width when collapsed
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed md:relative flex flex-col h-screen bg-slate-900 border-r border-slate-700 flex-shrink-0 z-50 overflow-hidden"
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-slate-800">
        <div className="flex items-center min-w-0">
          {/* Logo - Acts as expand button when collapsed */}
          <button
            type="button"
            onClick={() => {
              if (!isOpen) onToggle();
            }}
            className={`flex items-center justify-center min-w-[36px] rounded-md py-1 px-1 transition-colors ${
              !isOpen ? "hover:bg-slate-800 cursor-pointer" : "cursor-default"
            }`}
            title={!isOpen ? "Expand sidebar" : "Dawn and Dusk"}
            aria-label={!isOpen ? "Expand sidebar" : "Dawn and Dusk"}
            tabIndex={!isOpen ? 0 : -1}
          >
            <SplitSunMoonLogo className="w-6 h-6 text-slate-100" />
          </button>
          <motion.span
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
            className="ml-3 font-semibold text-slate-100 whitespace-nowrap overflow-hidden"
          >
            Dawn and Dusk
          </motion.span>
        </div>

        {/* Collapse Button - Only visible when open */}
        {isOpen && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800 transition-colors"
            title="Collapse sidebar"
          >
            <IconLayoutSidebarLeftCollapse className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center p-2 rounded-md transition-colors w-full ${
                isActive
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
              title={!isOpen ? tab.label : undefined}
            >
              <div className="flex items-center justify-center min-w-[28px]">
                <Icon className="w-5 h-5" />
              </div>
              {/* Label */}
              <motion.span
                animate={{
                  opacity: isOpen ? 1 : 0,
                  width: isOpen ? "auto" : 0,
                }}
                className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </nav>
      {/* Footer toggle removed */}
    </motion.div>
  );
}
