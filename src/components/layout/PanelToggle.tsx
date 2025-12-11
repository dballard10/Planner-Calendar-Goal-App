import { IconLayoutSidebarRight } from "@tabler/icons-react";

interface PanelToggleProps {
  onClick: () => void;
  isOpen?: boolean;
  className?: string;
  label?: string;
}

export function PanelToggle({ 
  onClick, 
  isOpen = false, 
  className = "",
  label = "Toggle panel"
}: PanelToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${
        isOpen 
          ? "bg-slate-700 text-slate-100" 
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      } ${className}`}
      aria-label={label}
      aria-expanded={isOpen}
      title={label}
    >
      <IconLayoutSidebarRight className="w-5 h-5" />
    </button>
  );
}


