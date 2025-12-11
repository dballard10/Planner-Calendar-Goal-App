import { useState } from "react";
import {
  IconClock,
  IconMapPin,
  IconUsers,
  IconTarget,
  IconRepeat,
  IconAlignLeft,
} from "@tabler/icons-react";
import type { TaskKind, AnySubtype } from "../../types/weekly";
import {
  eventSubtypes,
  taskSubtypes,
  subtypePickerStyles,
} from "./subtypeStyles";

interface TaskDetailsFormProps {
  kind: TaskKind;
  initialValues?: {
    subtype?: AnySubtype;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
    people?: string;
    goals?: string;
  };
  onChange?: (values: any) => void;
}

export default function TaskDetailsForm({
  kind,
  initialValues,
  onChange,
}: TaskDetailsFormProps) {
  // Local state for form fields
  const [subtype, setSubtype] = useState<AnySubtype | undefined>(
    initialValues?.subtype
  );
  const [startDate, setStartDate] = useState(initialValues?.startDate || "");
  const [endDate, setEndDate] = useState(initialValues?.endDate || "");
  const [startTime, setStartTime] = useState(initialValues?.startTime || "");
  const [endTime, setEndTime] = useState(initialValues?.endTime || "");
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [location, setLocation] = useState(initialValues?.location || "");
  const [people, setPeople] = useState(initialValues?.people || "");
  const [goals, setGoals] = useState(initialValues?.goals || "");

  // Update subtype if kind changes and current subtype is invalid for new kind?
  // Or just let the parent handle it.
  // Ideally if kind switches from task to event, we might want to clear subtype or pick a default.
  // For now, we'll just respect the passed initialValues or keep state.
  // Actually, if 'kind' prop changes, we probably should reset the subtype options displayed.

  // Helper to handle changes and notify parent if needed
  const handleChange = (field: string, value: any) => {
    // Update local state based on field
    switch (field) {
      case "subtype":
        setSubtype(value);
        break;
      case "startDate":
        setStartDate(value);
        break;
      case "endDate":
        setEndDate(value);
        break;
      case "startTime":
        setStartTime(value);
        break;
      case "endTime":
        setEndTime(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "location":
        setLocation(value);
        break;
      case "people":
        setPeople(value);
        break;
      case "goals":
        setGoals(value);
        break;
    }

    // Notify parent
    if (onChange) {
      onChange({
        subtype: field === "subtype" ? value : subtype,
        startDate: field === "startDate" ? value : startDate,
        endDate: field === "endDate" ? value : endDate,
        startTime: field === "startTime" ? value : startTime,
        endTime: field === "endTime" ? value : endTime,
        description: field === "description" ? value : description,
        location: field === "location" ? value : location,
        people: field === "people" ? value : people,
        goals: field === "goals" ? value : goals,
      });
    }
  };

  const availableSubtypes = kind === "event" ? eventSubtypes : taskSubtypes;

  return (
    <div className="flex flex-col gap-6">
      {/* Subtype Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
          Subtype
        </label>
        <div className="grid grid-cols-4 gap-2">
          {availableSubtypes.map((st) => {
            const style = subtypePickerStyles[st];
            const isSelected = subtype === st;
            return (
              <button
                key={st}
                onClick={() => handleChange("subtype", st)}
                className={`
                  relative group flex flex-col items-center justify-center rounded-lg overflow-hidden transition-all duration-200
                  ${
                    isSelected
                      ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 opacity-100 scale-[1.02]"
                      : "opacity-60 hover:opacity-100 hover:scale-[1.02]"
                  }
                `}
                title={style.label}
              >
                <div
                  className={`w-full aspect-[4/3] relative flex items-center justify-center ${style.background}`}
                >
                  <img
                    src={`/subtask_images/${st}.png`}
                    alt={style.label}
                    className="w-8 h-8 object-contain drop-shadow-md mb-3 transition-transform group-hover:scale-110 duration-200"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <span className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-bold text-white/95 tracking-wide drop-shadow-md z-10 leading-none">
                    {style.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-slate-100 font-medium">
          <IconClock size={18} className="text-blue-400" />
          <h3>Schedule</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Repeating Placeholder */}
        <div className="mt-1 p-3 rounded bg-slate-800/30 border border-slate-700/50 flex items-center justify-between opacity-75">
          <div className="flex items-center gap-2 text-slate-400">
            <IconRepeat size={16} />
            <span className="text-sm">Repeating</span>
          </div>
          <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400">
            Coming soon
          </span>
        </div>
      </div>

      <div className="h-px bg-slate-700/50" />

      {/* Details Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-100 font-medium">
          <IconAlignLeft size={18} className="text-purple-400" />
          <h3>Details</h3>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Add notes, subtasks, or details..."
            rows={4}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-y min-h-[100px]"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <IconMapPin size={12} /> Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Add location"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      <div className="h-px bg-slate-700/50" />

      {/* People & Goals Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-100 font-medium">
          <IconUsers size={18} className="text-green-400" />
          <h3>Context</h3>
        </div>

        {/* People */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <IconUsers size={12} /> People
          </label>
          <input
            type="text"
            value={people}
            onChange={(e) => handleChange("people", e.target.value)}
            placeholder="Add people..."
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
          />
          <p className="text-[10px] text-slate-500">UI-only for now</p>
        </div>

        {/* Goals */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <IconTarget size={12} /> Goals Attached
          </label>
          <input
            type="text"
            value={goals}
            onChange={(e) => handleChange("goals", e.target.value)}
            placeholder="Link goals..."
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
          />
          <p className="text-[10px] text-slate-500">UI-only for now</p>
        </div>
      </div>
    </div>
  );
}
