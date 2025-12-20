import { useState } from "react";
import {
  IconClock,
  IconMapPin,
  IconRepeat,
  IconAlignLeft,
} from "@tabler/icons-react";

interface TaskDetailsFormValues {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  people?: string;
  goals?: string;
  linksMarkdown?: string;
}

interface TaskDetailsFormProps {
  initialValues?: TaskDetailsFormValues;
  onChange?: (values: TaskDetailsFormValues) => void;
}

const LINK_LINE_REGEX = /^\s*-\s*(?:\[(.*?)\]\((.*?)\)|(.*\S.*))$/;

interface ParsedLink {
  label?: string;
  url: string;
  raw: string;
}

interface LinkEntry extends ParsedLink {
  index: number;
}

const parseLinkLine = (line: string): ParsedLink | null => {
  const trimmed = line.trim();
  const match = trimmed.match(LINK_LINE_REGEX);
  if (!match) {
    if (!trimmed) {
      return null;
    }
    return {
      label: trimmed,
      url: trimmed,
      raw: trimmed,
    };
  }

  const label = match[1];
  const url = match[2];
  const fallback = match[3]?.trim();

  if (label && url) {
    return { label, url, raw: trimmed };
  }

  const finalUrl = fallback || "";
  return { label: finalUrl, url: finalUrl, raw: trimmed };
};

const normalizeLinkUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed);
  const candidate = hasProtocol ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    return url.href;
  } catch {
    return "";
  }
};

const buildLinkLine = (url: string, label?: string) =>
  label ? `- [${label}](${url})` : `- ${url}`;

const cleanLinkLines = (markdown: string) =>
  markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const joinLinkLines = (lines: string[]) => lines.join("\n");

export default function TaskDetailsForm({
  initialValues,
  onChange,
}: TaskDetailsFormProps) {
  // Local state for form fields
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
  const [linksMarkdown, setLinksMarkdown] = useState(
    initialValues?.linksMarkdown || ""
  );
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");

  // Helper to handle changes and notify parent if needed
  const handleChange = (field: string, value: any) => {
    // Update local state based on field
    switch (field) {
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
      case "linksMarkdown":
        setLinksMarkdown(value);
        break;
    }

    // Notify parent
    if (onChange) {
      onChange({
        startDate: field === "startDate" ? value : startDate,
        endDate: field === "endDate" ? value : endDate,
        startTime: field === "startTime" ? value : startTime,
        endTime: field === "endTime" ? value : endTime,
        description: field === "description" ? value : description,
        location: field === "location" ? value : location,
        people: field === "people" ? value : people,
        goals: field === "goals" ? value : goals,
        linksMarkdown: field === "linksMarkdown" ? value : linksMarkdown,
      });
    }
  };

  const linkLines = cleanLinkLines(linksMarkdown);
  const linkEntries = linkLines
    .map((line, index) => {
      const parsed = parseLinkLine(line);
      return parsed ? { ...parsed, index } : null;
    })
    .filter((entry): entry is LinkEntry => Boolean(entry));

  const normalizedNewLinkUrl = normalizeLinkUrl(newLinkUrl);
  const canAddLink = Boolean(normalizedNewLinkUrl);

  const handleAddLink = () => {
    if (!normalizedNewLinkUrl) return;
    const label = newLinkLabel.trim() || undefined;
    const nextLine = buildLinkLine(normalizedNewLinkUrl, label);
    const nextLines = [...linkLines, nextLine];
    handleChange("linksMarkdown", joinLinkLines(nextLines));
    setNewLinkUrl("");
    setNewLinkLabel("");
  };

  const handleRemoveLink = (index: number) => {
    const nextLines = linkLines.filter((_, idx) => idx !== index);
    handleChange("linksMarkdown", joinLinkLines(nextLines));
  };

  return (
    <div className="flex flex-col gap-6">
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
        {/* Links Section */}
        <div className="flex flex-col gap-3">
          <label className="text-xs text-slate-400">Links</label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="Label (optional)"
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddLink}
                disabled={!canAddLink}
                className="rounded px-3 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add link
              </button>
            </div>
          </div>
          {linkEntries.length > 0 ? (
            <div className="flex flex-col gap-2 pt-1">
              {linkEntries.map((entry) => (
                <div
                  key={`${entry.index}-${entry.url}`}
                  className="flex items-center justify-between gap-4 rounded border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-200"
                >
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="truncate text-slate-100 underline-offset-4 hover:text-white hover:underline"
                  >
                    {entry.label || entry.url}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(entry.index)}
                    className="text-xs text-rose-400 hover:text-rose-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No links added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
