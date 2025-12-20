import type { WeeklyItemType } from "../../../types/weekly";

export interface TaskCardStyleOptions {
  backgroundClass?: string;
  textClass?: string;
  isClickable?: boolean;
  itemType?: WeeklyItemType;
}

export const TASK_CARD_CONTAINER =
  "group relative w-full max-w-[1100px] mx-auto rounded border overflow-hidden transition-all";
export const TASK_CARD_BODY = "flex items-center gap-2 w-full p-2 pr-8";
export const TASK_CARD_TITLE_INPUT =
  "flex-1 w-full px-2 py-1 bg-transparent rounded text-inherit focus:outline-none";
export const TASK_CARD_TITLE_DISPLAY =
  "inline-block text-inherit cursor-text transition-transform origin-left hover:scale-105";
export const TASK_CARD_TITLE_WRAPPER = "flex-1 px-2 py-1 select-none truncate";
export const TASK_CARD_INDICATORS_ROW =
  "flex items-center gap-2 transition-transform duration-200 ease-out group-hover:-translate-x-3 group-focus-within:-translate-x-3";
export const TASK_INDICATOR_GROUP =
  "flex items-center gap-3 px-2 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0";
export const TASK_KIND_BADGE =
  "flex-shrink-0 h-6 flex items-center justify-center min-w-[40px]";
export const TASK_DELETE_BUTTON =
  "absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded transition-all duration-200 ease-out text-slate-400 hover:text-red-400 hover:bg-slate-800 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto";

export const TASK_TYPE_GRADIENTS_TO_SLATE: Record<WeeklyItemType, string> = {
  task: "bg-gradient-to-r from-emerald-700/70 to-slate-950",
  event: "bg-gradient-to-r from-blue-700/70 to-slate-950",
  birthday: "bg-gradient-to-r from-pink-700/70 to-slate-950",
  holiday: "bg-gradient-to-r from-red-700/70 to-slate-950",
};

export function getTaskCardStyleClass(options: TaskCardStyleOptions = {}) {
  const gradientClass =
    TASK_TYPE_GRADIENTS_TO_SLATE[options.itemType ?? "task"];
  const backgroundClass = options.backgroundClass || gradientClass;
  const textClass = options.textClass || "text-slate-200";
  const interactionClass = options.isClickable
    ? "cursor-pointer"
    : "cursor-default";
  return `${backgroundClass} ${textClass} border-slate-700 hover:border-slate-500 shadow-sm ${interactionClass}`;
}

