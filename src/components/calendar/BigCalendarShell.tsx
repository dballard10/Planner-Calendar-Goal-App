import React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { CalendarEvent, CalendarViewMode } from "../../types/calendar";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom styles override
import "./BigCalendarOverrides.css"; 

interface BigCalendarShellProps {
  events: CalendarEvent[];
  viewMode: CalendarViewMode;
  date: Date;
  onNavigate: (newDate: Date) => void;
  onViewChange: (newView: CalendarViewMode) => void;
}

export default function BigCalendarShell({
  events,
  viewMode,
  date,
  onNavigate,
  onViewChange,
}: BigCalendarShellProps) {
  
  // Map our ViewMode to RBC View
  // RBC views: 'month', 'week', 'work_week', 'day', 'agenda'
  const rbcView = viewMode === 'year' ? 'month' : viewMode; // Fallback, though year shouldn't be here

  // Map our events to RBC events
  const rbcEvents = events.map(evt => ({
    id: evt.id,
    title: evt.title,
    start: new Date(evt.start),
    end: evt.end ? new Date(evt.end) : new Date(evt.start), // Default to start if no end
    allDay: !evt.end || evt.type === 'task', // Tasks are all day usually
    resource: evt
  }));

  const handleOnView = (view: View) => {
      // RBC types 'View' might not match exactly our 'CalendarViewMode'
      // We only support month, week, day
      if (view === 'month' || view === 'week' || view === 'day') {
          onViewChange(view);
      }
  };

  return (
    <div className="h-full w-full bg-slate-900 text-slate-200 p-2 rounded-lg">
      <Calendar
        localizer={localizer}
        events={rbcEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        view={rbcView as View}
        date={date}
        onNavigate={onNavigate}
        onView={handleOnView}
        toolbar={false} // We use our own toolbar in CalendarView
        components={{
          event: ({ event }) => (
            <div className={`text-xs ${event.resource.type === 'task' ? 'opacity-90' : 'font-bold'}`}>
               {event.title}
            </div>
          )
        }}
      />
    </div>
  );
}

