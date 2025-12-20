import React, { useState, useMemo } from "react";
import WeeklyView from "./components/weekly/WeeklyView";
import CalendarView from "./components/calendar/CalendarView";
import GoalsPage from "./components/goals/GoalsPage";
import CompanionsPage from "./components/goals/CompanionsPage";
import { AppShellLayout } from "./components/layout/AppShellLayout";
import { useWeekState } from "./hooks/useWeekState";
import { convertWeekToCalendarEvents } from "./lib/calendar/eventAdapters";

function App() {
  const [activeTab, setActiveTab] = useState("weekly");
  const { weekState, actions } = useWeekState();
  const [pendingWeeklyTaskId, setPendingWeeklyTaskId] = useState<string | null>(
    null
  );

  const handleOpenWeeklyTask = (taskId: string) => {
    setPendingWeeklyTaskId(taskId);
    setActiveTab("weekly");
  };

  // Convert weekly tasks to calendar events
  const calendarEvents = useMemo(() => {
    return convertWeekToCalendarEvents(weekState);
  }, [weekState]);

  return (
    <AppShellLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "weekly" && (
        <WeeklyView
          weekState={weekState}
          actions={actions}
          openTaskId={pendingWeeklyTaskId}
          onOpenTaskHandled={() => setPendingWeeklyTaskId(null)}
        />
      )}
      {activeTab === "calendar" && <CalendarView events={calendarEvents} />}
      {activeTab === "goals" && (
        <GoalsPage
          weekState={weekState}
          actions={actions}
          onOpenWeeklyTask={handleOpenWeeklyTask}
        />
      )}
      {activeTab === "companions" && (
        <CompanionsPage weekState={weekState} actions={actions} />
      )}
    </AppShellLayout>
  );
}

export default App;
