import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { IconMaximize, IconMinimize, IconX } from "@tabler/icons-react";

interface RightSidePanelProps {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
  showFloatingTrigger?: boolean;
}

export function RightSidePanel({
  title = "Panel",
  isOpen,
  onClose,
  children,
  className = "",
  showFloatingTrigger = false,
}: RightSidePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [widthTargets, setWidthTargets] = useState(() => ({
    collapsed: 384,
    expanded: 384,
  }));
  const { collapsed: collapsedWidthPx, expanded: expandedWidthPx } =
    widthTargets;

  // Reset expanded state when panel closes, so it opens in normal mode next time
  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateWidths = () => {
      if (typeof window === "undefined") {
        return;
      }
      const viewportWidth = window.innerWidth;
      const rootFontSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const collapsed = Math.min(24 * rootFontSize, viewportWidth);
      let sidebarWidth = 0;
      const rootEl = panelRef.current?.closest(
        ".app-shell-root"
      ) as HTMLElement | null;
      if (rootEl) {
        const raw = getComputedStyle(rootEl).getPropertyValue(
          "--app-left-sidebar-width"
        );
        const parsed = parseFloat(raw);
        if (!Number.isNaN(parsed)) {
          sidebarWidth = parsed;
        }
      }
      if (!sidebarWidth) {
        sidebarWidth = 260;
      }
      const expanded = Math.max(0, viewportWidth - sidebarWidth);

      setWidthTargets((prev) => {
        if (prev.collapsed === collapsed && prev.expanded === expanded) {
          return prev;
        }
        return { collapsed, expanded };
      });
    };

    updateWidths();
    const handleResize = () => updateWidths();
    window.addEventListener("resize", handleResize);

    const rootEl = panelRef.current?.closest(
      ".app-shell-root"
    ) as HTMLElement | null;
    const observer =
      rootEl && "MutationObserver" in window
        ? new MutationObserver(() => updateWidths())
        : null;
    if (observer && rootEl) {
      observer.observe(rootEl, {
        attributes: true,
        attributeFilter: ["style"],
      });
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, []);

  // Allow local toggle only if floating trigger is enabled and we need a way to open it
  // But typically the parent controls isOpen.
  // If showFloatingTrigger is true, we need a way to request open?
  // Actually, if we are fully controlled, the parent handles open.
  // But if we want to support the "floating button opens it" pattern, we need an onOpen prop or similar.
  // For now, let's assume the parent handles opening via other means (header),
  // and showFloatingTrigger is just a legacy or backup that calls an onOpen callback?
  // To keep it simple and match the plan: "Remove or minimize... in favor of header-based control".
  // I will just rely on props. If floating trigger is needed, we'd need an onOpen callback.
  // Since the plan says "gate it... likely false", I'll assume we don't need it active for now.

  const panelTransition: Transition = {
    x: {
      type: "spring",
      damping: 25,
      stiffness: 200,
    },
    width: {
      duration: 0.45,
      ease: "easeInOut",
    },
  };

  return (
    <>
      {/* Optional Floating Trigger - only if enabled */}
      {showFloatingTrigger && !isOpen && (
        <button
          onClick={() => {
            /* We need an onOpen prop if we want this to work, but for now parent controls it */
          }}
          className="fixed top-4 right-4 z-40 p-2 bg-slate-900 border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
          aria-label="Open panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </button>
      )}

      {/* Click-away backdrop: Only active when open and NOT full screen (expanded) */}
      {isOpen && !isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <motion.div
        layout
        initial={false}
        animate={{
          x: isOpen ? 0 : "100%",
          width: isExpanded ? expandedWidthPx : collapsedWidthPx,
        }}
        transition={panelTransition}
        className={`fixed inset-y-0 right-0 z-40 bg-slate-900 border-l border-slate-700 shadow-2xl ${className}`}
        style={{ maxWidth: "100%" }}
        ref={panelRef}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-slate-400 hover:text-slate-100 transition-colors rounded hover:bg-slate-800"
                aria-label={isExpanded ? "Exit full screen" : "Full screen"}
                title={isExpanded ? "Exit full screen" : "Full screen"}
              >
                {isExpanded ? (
                  <IconMinimize className="w-5 h-5" />
                ) : (
                  <IconMaximize className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-100 transition-colors rounded hover:bg-slate-800"
                aria-label="Close panel"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </motion.div>
    </>
  );
}
