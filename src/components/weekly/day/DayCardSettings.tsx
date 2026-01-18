import {
  IconAdjustmentsHorizontal,
  IconSortAscending,
  IconFilter,
  IconSettings,
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAnchoredMenu } from "../shared/useAnchoredMenu";
import type { TaskStatus } from "../../../types/weekly";

type MenuType = "sort" | "filter" | "settings" | null;

export type TaskFilter = "all" | TaskStatus;

export type DaySortMode =
  | "position"
  | "createdAt"
  | "titleAsc"
  | "type"
  | "status";

interface DayCardSettingsProps {
  taskFilter: TaskFilter;
  onTaskFilterChange: (next: TaskFilter) => void;
  sortMode: DaySortMode;
  onSortModeChange: (next: DaySortMode) => void;
}

const FILTER_OPTIONS: Array<{ value: TaskFilter; label: string }> = [
  { value: "all", label: "All tasks" },
  { value: "open", label: "Open only" },
  { value: "completed", label: "Completed only" },
  { value: "cancelled", label: "Cancelled only" },
  { value: "failed", label: "Failed only" },
];

const SORT_OPTIONS: Array<{ value: DaySortMode; label: string }> = [
  { value: "position", label: "Default" },
  { value: "titleAsc", label: "Title (A-Z)" },
  { value: "type", label: "Task type" },
  { value: "status", label: "Status" },
  { value: "createdAt", label: "Created time" },
];

export default function DayCardSettings({
  taskFilter,
  onTaskFilterChange,
  sortMode,
  onSortModeChange,
}: DayCardSettingsProps) {
  const [openMenu, setOpenMenu] = useState<MenuType>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const getRefForMenu = (menu: MenuType) => {
    switch (menu) {
      case "sort":
        return sortRef;
      case "filter":
        return filterRef;
      case "settings":
        return settingsRef;
      default:
        return null;
    }
  };

  const currentMenuWidth = openMenu === "settings" ? 160 : 128;
  const { position, open, close } = useAnchoredMenu({
    resolveAnchor: () => getRefForMenu(openMenu)?.current ?? null,
    menuWidth: currentMenuWidth,
  });

  useEffect(() => {
    if (openMenu) {
      open();
    } else {
      close();
    }
  }, [close, open, openMenu]);

  // Close menus when clicking outside (handled by portal overlay for click-away)
  // For hover logic, we use onMouseLeave with a delay
  const closeTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = (menu: MenuType) => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpenMenu(null);
    }, 150); // Small delay to allow moving to portal
  };

  // Handle ESC key to close menus
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openMenu) {
        setOpenMenu(null);
        close();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [close, openMenu]);

  return (
    <div ref={containerRef} className="relative flex items-center group z-20">
      {/* Base Icon Button */}
      <button
        type="button"
        className="p-1 text-slate-200 hover:text-slate-100 rounded transition-colors z-30"
        aria-label="Day settings"
      >
        <IconAdjustmentsHorizontal className="w-5 h-5" />
      </button>

      {/* Expandable Menu Container */}
      <div
        className={`absolute left-0 flex items-center bg-slate-800 rounded-r-lg pl-8 pr-2 py-1 gap-2 transition-all duration-300 ease-out origin-left ${
          openMenu
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 -translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto"
        }`}
      >
        {/* Sort Button */}
        <div
          ref={sortRef}
          className="relative"
          onMouseEnter={() => handleMouseEnter("sort")}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
              openMenu === "sort"
                ? "bg-slate-700 text-slate-100"
                : "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
            }`}
          >
            <IconSortAscending className="w-3 h-3" />
            Sort
          </button>
        </div>

        {/* Filter Button */}
        <div
          ref={filterRef}
          className="relative"
          onMouseEnter={() => handleMouseEnter("filter")}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
              openMenu === "filter"
                ? "bg-slate-700 text-slate-100"
                : "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
            }`}
          >
            <IconFilter className="w-3 h-3" />
            Filter
          </button>
        </div>

        {/* Settings Button */}
        <div
          ref={settingsRef}
          className="relative"
          onMouseEnter={() => handleMouseEnter("settings")}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
              openMenu === "settings"
                ? "bg-slate-700 text-slate-100"
                : "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
            }`}
          >
            <IconSettings className="w-3 h-3" />
            Settings
          </button>
        </div>
      </div>

      {/* Portal Dropdowns */}
      {openMenu &&
        position &&
        createPortal(
          <div
            className="fixed inset-0 z-50 pointer-events-none" // pointer-events-none allows clicks through to background if not hitting menu
          >
            {/* Dropdown itself needs pointer-events-auto */}
            <div
              className={`absolute rounded bg-slate-900 border border-slate-700 shadow-lg overflow-hidden pointer-events-auto ${
                openMenu === "settings" ? "w-40" : "w-32"
              }`}
              style={{ top: position.top, left: position.left }}
              onMouseEnter={() => {
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                  closeTimeoutRef.current = null;
                }
              }}
              onMouseLeave={() => {
                setOpenMenu(null);
              }}
            >
              <div className="py-1">
                {openMenu === "sort" &&
                  SORT_OPTIONS.map((option) => {
                    const isSelected = sortMode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onSortModeChange(option.value);
                          setOpenMenu(null);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs ${
                          isSelected
                            ? "bg-slate-800 text-slate-100"
                            : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                {openMenu === "filter" &&
                  FILTER_OPTIONS.map((option) => {
                    const isSelected = taskFilter === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onTaskFilterChange(option.value);
                          setOpenMenu(null);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs ${
                          isSelected
                            ? "bg-slate-800 text-slate-100"
                            : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                {openMenu === "settings" && (
                  <>
                    <button className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100">
                      Collapse default
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100">
                      Duplicate day
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100">
                      Clear completed
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
