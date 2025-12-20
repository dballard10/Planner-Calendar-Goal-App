import { useMemo, useRef, useState } from "react";
import { IconTarget, IconChevronDown, IconCheck, IconX } from "@tabler/icons-react";
import type { Goal } from "../../../types/weekly";
import {
  TASK_GOAL_BUTTON,
  TASK_GOAL_BUTTON_SELECTED,
  TASK_GOAL_BUTTON_UNSELECTED,
  TASK_GOAL_DROPDOWN,
  TASK_GOAL_PILL,
  TASK_GOAL_PILL_AVATAR_BORDER,
  TASK_GOAL_PILL_REMOVE_ICON,
  TASK_GOAL_PILLS_WRAP,
  TASK_GOAL_SELECTOR,
  TASK_GOAL_SELECTOR_LABEL,
  TASK_GOAL_TRIGGER,
} from "../styles";
import { useClickOutside } from "../shared/useClickOutside";

interface GoalMultiSelectProps {
  goals: Goal[];
  selectedGoalIds: string[];
  onChange: (goalIds: string[]) => void;
}

export function GoalMultiSelect({
  goals,
  selectedGoalIds,
  onChange,
}: GoalMultiSelectProps) {
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const goalDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside([goalDropdownRef], () => setIsGoalDropdownOpen(false), isGoalDropdownOpen);

  const selectedGoals = useMemo(
    () =>
      selectedGoalIds
        .map((id) => goals.find((g) => g.id === id))
        .filter((g): g is Goal => !!g),
    [goals, selectedGoalIds]
  );

  const handleToggleGoal = (goalId: string) => {
    const isSelected = selectedGoalIds.includes(goalId);
    const next = isSelected
      ? selectedGoalIds.filter((id) => id !== goalId)
      : [...selectedGoalIds, goalId];
    onChange(next);
  };

  return (
    <div className={TASK_GOAL_SELECTOR} ref={goalDropdownRef}>
      <div className={TASK_GOAL_SELECTOR_LABEL}>
        <IconTarget className="w-4 h-4" />
        Linked Goal
      </div>

      <div
        onClick={() => setIsGoalDropdownOpen(!isGoalDropdownOpen)}
        className={TASK_GOAL_TRIGGER}
      >
        <span className="text-slate-400 select-none">
          {selectedGoals.length > 0
            ? `${selectedGoals.length} goal${selectedGoals.length === 1 ? "" : "s"} linked`
            : "Select goals..."}
        </span>
        <IconChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${
            isGoalDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isGoalDropdownOpen && (
        <div className={TASK_GOAL_DROPDOWN}>
          <div className="p-1 space-y-0.5">
            {goals.length > 0 ? (
              goals.map((g) => {
                const isSelected = selectedGoalIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => handleToggleGoal(g.id)}
                    className={`${TASK_GOAL_BUTTON} ${
                      isSelected ? TASK_GOAL_BUTTON_SELECTED : TASK_GOAL_BUTTON_UNSELECTED
                    }`}
                  >
                    <span className="flex-shrink-0 w-5 text-center">{g.emoji}</span>
                    <span className="flex-1 truncate">{g.name}</span>
                    {isSelected && <IconCheck className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-xs text-slate-500 text-center italic">No goals available</div>
            )}
          </div>
        </div>
      )}

      <div className={TASK_GOAL_PILLS_WRAP}>
        {selectedGoals.length > 0 ? (
          selectedGoals.map((g) => (
            <button
              key={g.id}
              onClick={() => handleToggleGoal(g.id)}
              className={TASK_GOAL_PILL}
              title={`Unlink ${g.name}`}
            >
              <div className="relative w-5 h-5">
                <div
                  className={TASK_GOAL_PILL_AVATAR_BORDER}
                  style={{ backgroundColor: g.color ?? "#475569" }}
                >
                  <span className="text-[11px] leading-none">{g.emoji}</span>
                </div>
                <div className={TASK_GOAL_PILL_REMOVE_ICON}>
                  <IconX className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <span>{g.name}</span>
            </button>
          ))
        ) : (
          <div className="text-xs text-slate-500 italic">No goal linked.</div>
        )}
      </div>
    </div>
  );
}

