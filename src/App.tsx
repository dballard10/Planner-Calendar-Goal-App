import React, { useState, useMemo } from "react";
import WeeklyView from "./components/weekly/WeeklyView/WeeklyView";
import CalendarView from "./components/calendar/CalendarView";
import GoalsPage from "./components/goals/GoalsPage";
import CompanionsPage from "./components/goals/CompanionsPage";
import SettingsPage from "./components/settings/SettingsPage";
import { AppShellLayout } from "./components/layout/AppShellLayout";
import { useWeekState, getMostRecentSunday, formatDateISO } from "./hooks/useWeekState";
import { convertWeekToCalendarEvents } from "./lib/calendar/eventAdapters";
import { availableMockWeekStartsISO } from "./mock/weeks";

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

  const handleTabChange = (nextTab: string) => {
    if (nextTab === "weekly" && activeTab !== "weekly") {
      actions.setWeekStart(formatDateISO(getMostRecentSunday()));
      setActiveTab("weekly");
      return;
    }
    setActiveTab(nextTab);
  };

  // Convert weekly tasks to calendar events
  const calendarEvents = useMemo(() => {
    return convertWeekToCalendarEvents(weekState);
  }, [weekState]);

  return (
    <AppShellLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {activeTab === "weekly" && (
        <WeeklyView
          weekState={weekState}
          actions={actions}
          openTaskId={pendingWeeklyTaskId}
          onOpenTaskHandled={() => setPendingWeeklyTaskId(null)}
          availableWeekStartsISO={availableMockWeekStartsISO}
          onSelectWeekStart={(iso) => {
            actions.setWeekStart(iso);
            setActiveTab("weekly");
          }}
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
      {activeTab === "settings" && (
        <SettingsPage weekState={weekState} actions={actions} />
      )}
    </AppShellLayout>
  );
}

export default App;
