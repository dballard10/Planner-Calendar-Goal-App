import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { IconCalendar, IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import SegmentedDateInput from "./SegmentedDateInput";
import { useAnchoredMenu } from "../weekly/shared/useAnchoredMenu";
import { useClickOutside } from "../weekly/shared/useClickOutside";

interface DateInputWithPickerProps {
  value: string; // ISO YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function DateInputWithPicker({
  value,
  onChange,
  className,
  placeholder,
}: DateInputWithPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isOpen, position, toggle, close } = useAnchoredMenu({
    resolveAnchor: () => containerRef.current,
    menuWidth: 280,
    gap: 4,
  });

  useClickOutside([containerRef, menuRef], close, isOpen);

  // Sync viewDate when menu opens
  React.useEffect(() => {
    if (isOpen) {
      const initialDate = value ? new Date(value + "T00:00:00") : new Date();
      setViewDate(initialDate);
    }
  }, [isOpen, value]);

  // Parse current value for the picker, fallback to today
  const initialDate = value ? new Date(value + "T00:00:00") : new Date();
  const [viewDate, setViewDate] = useState(initialDate);

  const handleDateSelect = (date: Date) => {
    onChange(format(date, "yyyy-MM-dd"));
    close();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    close();
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate((prev) => addMonths(prev, 1));
  };

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div ref={containerRef} className="relative flex items-center w-full">
      <SegmentedDateInput
        value={value}
        onChange={onChange}
        className={`${className} w-full pr-10`}
        placeholder={placeholder}
      />
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className="absolute right-2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="Open calendar"
      >
        <IconCalendar size={18} />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-4 w-[280px]"
            style={{ top: position.top, left: position.left }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors"
              >
                <IconChevronLeft size={18} />
              </button>
              <h4 className="font-semibold text-slate-200">
                {format(viewDate, "MMMM yyyy")}
              </h4>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors"
              >
                <IconChevronRight size={18} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map((d, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] text-slate-500 font-bold uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const isCurrentMonth = isSameMonth(day, viewDate);
                const isSelected = value ? isSameDay(day, new Date(value + "T00:00:00")) : false;
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateSelect(day)}
                    className={`
                      h-8 w-8 flex items-center justify-center text-xs rounded-full transition-colors
                      ${!isCurrentMonth ? "text-slate-700" : "text-slate-300"}
                      ${
                        isSelected
                          ? "bg-blue-600 text-white font-bold"
                          : "hover:bg-slate-800"
                      }
                      ${
                        isToday && !isSelected
                          ? "ring-1 ring-blue-500 text-blue-400 font-bold"
                          : ""
                      }
                      ${isToday && isSelected ? "font-bold" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
