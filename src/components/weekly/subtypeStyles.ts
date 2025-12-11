import type { EventSubtype, TaskSubtype, AnySubtype } from "../../types/weekly";

interface SubtypeStyle {
  background: string;
  label: string;
  border?: string;
  text?: string;
}

// Helper maps to categorize subtypes
export const eventSubtypes: EventSubtype[] = [
  "meeting",
  "travel",
  "social",
  "work",
];

export const taskSubtypes: TaskSubtype[] = [
  "health",
  "daily",
  "work",
  "personal",
];

// --- Card Styles (Border Only) ---
// Used in the main panel for TaskCards.
// We keep the background empty or minimal because the TaskCard now uses
// the default task/event background, and applies these borders on top.
export const subtypeCardStyles: Record<AnySubtype, SubtypeStyle> = {
  // Event Subtypes
  birthday: {
    label: "Birthday",
    background: "", // Not used for card bg anymore
    border: "border-pink-500",
    text: "text-pink-400",
  },
  holiday: {
    label: "Holiday",
    background: "",
    border: "border-orange-500",
    text: "text-orange-400",
  },
  meeting: {
    label: "Meeting",
    background: "",
    border: "border-blue-500",
    text: "text-blue-400",
  },
  appointment: {
    label: "Appointment",
    background: "",
    border: "border-indigo-500",
    text: "text-indigo-400",
  },
  travel: {
    label: "Travel",
    background: "",
    border: "border-sky-500",
    text: "text-sky-400",
  },
  social: {
    label: "Social",
    background: "",
    border: "border-amber-500",
    text: "text-amber-400",
  },
  class: {
    label: "Class",
    background: "",
    border: "border-cyan-500",
    text: "text-cyan-400",
  },
  "focus-block": {
    label: "Focus Block",
    background: "",
    border: "border-slate-500",
    text: "text-slate-400",
  },
  reminder: {
    label: "Reminder",
    background: "",
    border: "border-yellow-500",
    text: "text-yellow-400",
  },

  // Task Subtypes
  work: {
    label: "Work",
    background: "",
    border: "border-slate-400",
    text: "text-slate-400",
  },
  personal: {
    label: "Personal",
    background: "",
    border: "border-emerald-500",
    text: "text-emerald-400",
  },
  chore: {
    label: "Chore",
    background: "",
    border: "border-orange-500",
    text: "text-orange-400",
  },
  errand: {
    label: "Errand",
    background: "",
    border: "border-lime-500",
    text: "text-lime-400",
  },
  health: {
    label: "Health",
    background: "",
    border: "border-rose-500",
    text: "text-rose-400",
  },
  finance: {
    label: "Finance",
    background: "",
    border: "border-yellow-500",
    text: "text-yellow-400",
  },
  learning: {
    label: "Learning",
    background: "",
    border: "border-violet-500",
    text: "text-violet-400",
  },
  creative: {
    label: "Creative",
    background: "",
    border: "border-fuchsia-500",
    text: "text-fuchsia-400",
  },
  daily: {
    label: "Daily",
    background: "",
    border: "border-blue-500",
    text: "text-blue-400",
  },
};

// --- Picker Styles (Brighter / Vibrant) ---
// Used in the TaskDetailsForm side panel
export const subtypePickerStyles: Record<AnySubtype, SubtypeStyle> = {
  // Event Subtypes
  birthday: {
    label: "Birthday",
    background: "bg-gradient-to-r from-pink-500 to-teal-400",
  },
  holiday: {
    label: "Holiday",
    background: "bg-gradient-to-r from-orange-500 to-red-500",
  },
  meeting: {
    label: "Meeting",
    background: "bg-gradient-to-r from-blue-500 to-indigo-600",
  },
  appointment: {
    label: "Appointment",
    background: "bg-gradient-to-r from-indigo-400 to-purple-500",
  },
  travel: {
    label: "Travel",
    background: "bg-gradient-to-r from-sky-400 to-blue-500",
  },
  social: {
    label: "Social",
    background: "bg-gradient-to-r from-amber-800 to-orange-900",
  },
  class: {
    label: "Class",
    background: "bg-gradient-to-r from-cyan-500 to-blue-500",
  },
  "focus-block": {
    label: "Focus Block",
    background: "bg-gradient-to-r from-slate-500 to-slate-700",
  },
  reminder: {
    label: "Reminder",
    background: "bg-gradient-to-r from-yellow-400 to-amber-500",
  },

  // Task Subtypes
  work: {
    label: "Work",
    background: "bg-gradient-to-r from-slate-400 to-slate-500",
  },
  personal: {
    label: "Personal",
    background: "bg-gradient-to-r from-emerald-400 to-teal-500",
  },
  chore: {
    label: "Chore",
    background: "bg-gradient-to-r from-orange-400 to-amber-500",
  },
  errand: {
    label: "Errand",
    background: "bg-gradient-to-r from-lime-400 to-green-500",
  },
  health: {
    label: "Health",
    background: "bg-gradient-to-r from-rose-400 to-red-500",
  },
  finance: {
    label: "Finance",
    background: "bg-gradient-to-r from-yellow-400 to-amber-500",
  },
  learning: {
    label: "Learning",
    background: "bg-gradient-to-r from-violet-400 to-purple-500",
  },
  creative: {
    label: "Creative",
    background: "bg-gradient-to-r from-fuchsia-400 to-pink-500",
  },
  daily: {
    label: "Daily",
    background: "bg-gradient-to-r from-blue-400 to-cyan-500",
  },
};

export function getSubtypeCardStyle(
  subtype?: AnySubtype
): SubtypeStyle | undefined {
  if (!subtype) return undefined;
  return subtypeCardStyles[subtype];
}

export function getSubtypePickerStyle(
  subtype?: AnySubtype
): SubtypeStyle | undefined {
  if (!subtype) return undefined;
  return subtypePickerStyles[subtype];
}

// Keep backward compatibility if needed, defaulting to Card style
export const subtypeStyles = subtypeCardStyles;
export function getSubtypeStyle(
  subtype?: AnySubtype
): SubtypeStyle | undefined {
  return getSubtypeCardStyle(subtype);
}
