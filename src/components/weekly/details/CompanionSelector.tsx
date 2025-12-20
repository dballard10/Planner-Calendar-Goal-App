import { useMemo, useRef, useState } from "react";
import { IconUsers, IconSearch, IconX } from "@tabler/icons-react";
import type { Companion } from "../../../types/weekly";
import {
  TASK_COMPANION_AVATAR,
  TASK_COMPANION_DROPDOWN,
  TASK_COMPANION_INPUT,
  TASK_COMPANION_INPUT_WRAPPER,
  TASK_COMPANION_LABEL,
  TASK_COMPANION_PILL,
  TASK_COMPANION_PILL_AVATAR,
  TASK_COMPANION_PILL_ICON,
  TASK_COMPANION_SELECTED_LIST,
  TASK_COMPANION_SELECTOR,
  TASK_COMPANION_SHOW_MORE_BUTTON,
  TASK_COMPANION_SUGGESTION,
} from "../styles";
import { useClickOutside } from "../shared/useClickOutside";
import { getInitials } from "../utils/name";

interface CompanionSelectorProps {
  companions: Companion[];
  selectedIds: string[];
  onChange: (companionIds: string[]) => void;
}

export function CompanionSelector({
  companions,
  selectedIds,
  onChange,
}: CompanionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCompanions, setShowAllCompanions] = useState(false);
  const [isCompanionDropdownOpen, setIsCompanionDropdownOpen] = useState(false);
  const companionDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    [companionDropdownRef],
    () => setIsCompanionDropdownOpen(false),
    isCompanionDropdownOpen
  );

  const selectedCompanions = useMemo(
    () =>
      selectedIds
        .map((id) => companions.find((c) => c.id === id))
        .filter((c): c is Companion => !!c),
    [companions, selectedIds]
  );

  const availableCompanions = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return companions.filter((c) => !selectedSet.has(c.id));
  }, [companions, selectedIds]);

  const filteredAvailableCompanions = useMemo(() => {
    if (!searchQuery.trim()) return availableCompanions;
    const lowerQuery = searchQuery.toLowerCase();
    return availableCompanions.filter((c) =>
      c.name.toLowerCase().includes(lowerQuery)
    );
  }, [availableCompanions, searchQuery]);

  const companionSuggestions = searchQuery.trim()
    ? filteredAvailableCompanions
    : availableCompanions.slice(0, 5);

  const handleToggleCompanion = (companionId: string) => {
    if (selectedIds.includes(companionId)) {
      onChange(selectedIds.filter((id) => id !== companionId));
    } else {
      onChange([...selectedIds, companionId]);
    }
  };

  return (
    <div className={TASK_COMPANION_SELECTOR}>
      <div className={TASK_COMPANION_LABEL}>
        <IconUsers className="w-4 h-4" />
        Companions
      </div>

      <div className={TASK_COMPANION_INPUT_WRAPPER} ref={companionDropdownRef}>
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search to add..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsCompanionDropdownOpen(true)}
          className={TASK_COMPANION_INPUT}
        />

        {isCompanionDropdownOpen && (
          <div className={TASK_COMPANION_DROPDOWN}>
            {companionSuggestions.length > 0 ? (
              <div className="p-1 space-y-0.5">
                {companionSuggestions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      handleToggleCompanion(c.id);
                      setSearchQuery("");
                    }}
                    className={TASK_COMPANION_SUGGESTION}
                  >
                    <div
                      className={TASK_COMPANION_AVATAR}
                      style={{ backgroundColor: c.color || "#64748b" }}
                    >
                      {getInitials(c.name)}
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 text-xs text-slate-500 text-center italic">
                No companions available to add
              </div>
            )}
          </div>
        )}
      </div>

      <div className={TASK_COMPANION_SELECTED_LIST}>
        {selectedCompanions.length > 0 ? (
          <>
            {selectedCompanions
              .slice(0, showAllCompanions ? undefined : 5)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleToggleCompanion(c.id)}
                  className={TASK_COMPANION_PILL}
                  title={`Remove ${c.name}`}
                >
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <div
                      className={TASK_COMPANION_PILL_AVATAR}
                      style={{ backgroundColor: c.color || "#64748b" }}
                    >
                      {getInitials(c.name)}
                    </div>
                    <div className={TASK_COMPANION_PILL_ICON}>
                      <IconX className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span>{c.name}</span>
                </button>
              ))}

            {selectedCompanions.length > 5 && (
              <button
                onClick={() => setShowAllCompanions(!showAllCompanions)}
                className={TASK_COMPANION_SHOW_MORE_BUTTON}
              >
                {showAllCompanions
                  ? "Show Less"
                  : `+${selectedCompanions.length - 5} more`}
              </button>
            )}
          </>
        ) : (
          <div className="text-xs text-slate-500 italic">No companions linked.</div>
        )}
      </div>
    </div>
  );
}

