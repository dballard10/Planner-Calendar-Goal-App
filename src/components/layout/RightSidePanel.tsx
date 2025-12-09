import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

  // Reset expanded state when panel closes, so it opens in normal mode next time
  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen]);

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
        initial={false}
        animate={{
          x: isOpen ? 0 : "100%",
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed z-50 bg-slate-900 border-l border-slate-700 shadow-2xl ${
          isExpanded
            ? "md:absolute md:left-0 md:right-0 w-full md:w-auto h-full inset-y-0 right-0"
            : "fixed inset-y-0 right-0 w-full md:w-96"
        } ${className}`}
        style={isExpanded ? { top: 0, bottom: 0 } : undefined}
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
