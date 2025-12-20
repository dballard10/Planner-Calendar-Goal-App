import { motion } from "framer-motion";
import {
  IconLayoutSidebarLeftCollapse,
  IconCalendarWeek,
  IconTarget,
  IconCalendar,
  IconUsers,
} from "@tabler/icons-react";

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

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
    { id: "companions", label: "Companions", icon: IconUsers },
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
          const handleTabClick = () => {
            onTabChange(tab.id);
          };
          return (
            <div key={tab.id}>
              <button
                onClick={handleTabClick}
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
            </div>
          );
        })}
      </nav>

      {/* Footer toggle removed */}
    </motion.div>
  );
}
