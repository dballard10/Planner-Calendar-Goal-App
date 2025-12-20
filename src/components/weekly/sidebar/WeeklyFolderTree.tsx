import { IconChevronRight } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

interface WeeklyFolderTreeProps {
  selectedWeekStartISO?: string;
  availableWeekStartsISO: string[];
  onSelectWeekStart: (iso: string) => void;
}

const ISO_DATE_FORMAT = "en-US";

function formatMonth(monthIndex: number): string {
  return new Date(2020, monthIndex, 1).toLocaleDateString(ISO_DATE_FORMAT, {
    month: "long",
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString(ISO_DATE_FORMAT, {
    month: "short",
    day: "numeric",
  });
}

interface WeekItem {
  iso: string;
  date: Date;
  weekLabel: string;
  year: string;
  month: string;
}

function buildWeekItems(isoDates: string[]): WeekItem[] {
  return [...isoDates]
    .filter(Boolean)
    .map((iso) => {
      const date = new Date(iso);
      const end = new Date(date);
      end.setDate(end.getDate() + 6);
      return {
        iso,
        date,
        weekLabel: `${formatShortDate(date)} - ${formatShortDate(end)}`,
        year: date.getFullYear().toString(),
        month: formatMonth(date.getMonth()),
      };
    })
    .sort((a, b) => (a.iso < b.iso ? 1 : -1));
}

function sanitizeId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function WeeklyFolderTree({
  selectedWeekStartISO,
  availableWeekStartsISO,
  onSelectWeekStart,
}: WeeklyFolderTreeProps) {
  const weekItems = useMemo(
    () => buildWeekItems(availableWeekStartsISO),
    [availableWeekStartsISO]
  );

  const focusISO = selectedWeekStartISO ?? weekItems[0]?.iso;
  const focusWeekItem = weekItems.find((item) => item.iso === focusISO);
  const initialFocusYear = focusWeekItem?.year;
  const initialFocusMonthKey =
    focusWeekItem && `${focusWeekItem.year}::${focusWeekItem.month}`;

  const [expandedYears, setExpandedYears] = useState<Set<string>>(() => {
    const initialSet = new Set<string>();
    if (initialFocusYear) {
      initialSet.add(initialFocusYear);
    }
    return initialSet;
  });
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => {
    const initialSet = new Set<string>();
    if (initialFocusMonthKey) {
      initialSet.add(initialFocusMonthKey);
    }
    return initialSet;
  });

  useEffect(() => {
    if (!selectedWeekStartISO) {
      return;
    }
    const selectedItem = weekItems.find(
      (item) => item.iso === selectedWeekStartISO
    );
    if (!selectedItem) {
      return;
    }

    setExpandedYears((previous) => {
      if (previous.has(selectedItem.year)) {
        return previous;
      }
      const next = new Set(previous);
      next.add(selectedItem.year);
      return next;
    });

    const monthKey = `${selectedItem.year}::${selectedItem.month}`;
    setExpandedMonths((previous) => {
      if (previous.has(monthKey)) {
        return previous;
      }
      const next = new Set(previous);
      next.add(monthKey);
      return next;
    });
  }, [selectedWeekStartISO, weekItems]);

  const groupedByYear = useMemo(() => {
    return weekItems.reduce<Record<string, Record<string, WeekItem[]>>>(
      (acc, item) => {
        if (!acc[item.year]) {
          acc[item.year] = {};
        }
        if (!acc[item.year][item.month]) {
          acc[item.year][item.month] = [];
        }
        acc[item.year][item.month].push(item);
        return acc;
      },
      {}
    );
  }, [weekItems]);

  const toggleYear = (year: string) => {
    setExpandedYears((previous) => {
      const next = new Set(previous);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((previous) => {
      const next = new Set(previous);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3 text-sm text-slate-200">
      {Object.entries(groupedByYear).map(([year, months]) => {
        const yearId = `year-${sanitizeId(year)}`;
        const isYearExpanded = expandedYears.has(year);
        return (
          <div key={year} className="space-y-1">
            <button
              type="button"
              onClick={() => toggleYear(year)}
              className="flex items-center gap-2 font-semibold text-slate-100 transition-colors hover:text-slate-50"
              aria-expanded={isYearExpanded}
              aria-controls={yearId}
            >
              <IconChevronRight
                className={`w-3 h-3 transition-transform ${
                  isYearExpanded ? "rotate-90" : ""
                }`}
              />
              {year}
            </button>
            {isYearExpanded && (
              <div id={yearId} className="ml-3 space-y-2">
                {Object.entries(months).map(([month, weeks]) => {
                  const monthKey = `${year}::${month}`;
                  const monthId = `month-${sanitizeId(monthKey)}`;
                  const isMonthExpanded = expandedMonths.has(monthKey);
                  return (
                    <div key={month} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleMonth(monthKey)}
                        className="flex w-full items-center gap-2 text-left text-sm font-medium text-slate-300 transition-colors hover:text-slate-200"
                        aria-expanded={isMonthExpanded}
                        aria-controls={monthId}
                      >
                        <IconChevronRight
                          className={`w-3 h-3 transition-transform ${
                            isMonthExpanded ? "rotate-90" : ""
                          }`}
                        />
                        <span>{month}</span>
                      </button>
                      {isMonthExpanded && (
                        <div id={monthId} className="ml-3 space-y-1">
                          {weeks.map((week) => {
                            const isSelected =
                              week.iso === selectedWeekStartISO;
                            return (
                              <button
                                key={week.iso}
                                type="button"
                                onClick={() => onSelectWeekStart(week.iso)}
                                className={`w-full text-left font-medium transition-colors ${
                                  isSelected
                                    ? "text-slate-100"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                {week.weekLabel}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
