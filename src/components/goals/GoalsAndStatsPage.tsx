import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconPlus,
  IconDotsVertical,
  IconTrash,
  IconEdit,
  IconTarget,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import type { WeekState, Goal, Task } from "../../types/weekly";
import PageHeader from "../layout/PageHeader";
import { computeWeekStats } from "../../lib/weekly/stats";

interface GoalsAndStatsPageProps {
  weekState: WeekState;
  actions: {
    addGoal: (name: string, emoji?: string) => void;
    updateGoal: (
      id: string,
      updates: Partial<Omit<Goal, "id" | "createdAt">>
    ) => void;
    deleteGoal: (id: string) => void;
  };
}

export default function GoalsAndStatsPage({
  weekState,
  actions,
}: GoalsAndStatsPageProps) {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalEmoji, setNewGoalEmoji] = useState("🎯");

  // Date Range State (Stub for now)
  const [dateRange, setDateRange] = useState<"week" | "month" | "custom">(
    "week"
  );

  // Compute stats
  const weekStats = useMemo(() => computeWeekStats(weekState), [weekState]);

  // Compute Goal Stats
  const goalStats = useMemo(() => {
    return weekState.goals.map((goal) => {
      const linkedTasks = weekState.tasks.filter(
        (t) => t.goalId === goal.id && t.status !== "cancelled" && !t.movedTo
      );
      const total = linkedTasks.length;
      const completed = linkedTasks.filter(
        (t) => t.status === "completed"
      ).length;
      const failed = linkedTasks.filter((t) => t.status === "failed").length;
      const open = linkedTasks.filter((t) => t.status === "open").length;

      const completionRate =
        total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...goal,
        stats: { total, completed, failed, open, completionRate },
      };
    });
  }, [weekState.goals, weekState.tasks]);

  // Compute Companion Stats
  const companionStats = useMemo(() => {
    const tasksWithCompanions = weekState.tasks.filter(
      (t) =>
        t.companionIds && t.companionIds.length > 0 && t.status !== "cancelled"
    );
    const total = tasksWithCompanions.length;
    const completed = tasksWithCompanions.filter(
      (t) => t.status === "completed"
    ).length;
    const failed = tasksWithCompanions.filter(
      (t) => t.status === "failed"
    ).length;

    // Top companion
    const companionCounts: Record<string, number> = {};
    weekState.tasks.forEach((t) => {
      t.companionIds?.forEach((cid) => {
        companionCounts[cid] = (companionCounts[cid] || 0) + 1;
      });
    });

    let topCompanionId = null;
    let maxCount = 0;
    Object.entries(companionCounts).forEach(([cid, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCompanionId = cid;
      }
    });

    const topCompanionName = topCompanionId
      ? weekState.companions.find((c) => c.id === topCompanionId)?.name
      : null;

    return { total, completed, failed, topCompanionName };
  }, [weekState.tasks, weekState.companions]);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalName.trim()) {
      actions.addGoal(newGoalName, newGoalEmoji);
      setNewGoalName("");
      setNewGoalEmoji("🎯");
      setIsAddGoalOpen(false);
    }
  };

  const handleUpdateGoal = (id: string, name: string, emoji: string) => {
    actions.updateGoal(id, { name, emoji });
    setEditingGoalId(null);
  };

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <PageHeader title="Goals & Insights" />

      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Goals */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <IconTarget className="w-5 h-5 text-indigo-400" />
              Goals
            </h2>
            <button
              onClick={() => setIsAddGoalOpen(true)}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center gap-2 text-sm transition-colors"
            >
              <IconPlus className="w-4 h-4" />
              Add Goal
            </button>
          </div>

          {isAddGoalOpen && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col gap-3"
              onSubmit={handleCreateGoal}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoalEmoji}
                  onChange={(e) => setNewGoalEmoji(e.target.value)}
                  className="w-12 p-2 bg-slate-900 border border-slate-700 rounded text-center text-xl focus:border-indigo-500 outline-none"
                  placeholder="Emoji"
                />
                <input
                  type="text"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:border-indigo-500 outline-none"
                  placeholder="Goal name (e.g. Learn French)"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </motion.form>
          )}

          <div className="grid gap-4">
            {goalStats.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdateGoal}
                onDelete={actions.deleteGoal}
                isEditing={editingGoalId === goal.id}
                setEditingId={setEditingGoalId}
              />
            ))}
            {goalStats.length === 0 && !isAddGoalOpen && (
              <div className="text-center p-8 border border-dashed border-slate-800 rounded-lg text-slate-500">
                No goals yet. Add one to start tracking!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Statistics & Insights */}
        <div className="space-y-8">
          {/* Date Range Selector */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <IconTrendingUp className="w-5 h-5 text-emerald-400" />
              Statistics
            </h2>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              {(["week", "month", "custom"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    dateRange === range
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {range === "week"
                    ? "This Week"
                    : range === "month"
                    ? "Month"
                    : "Custom"}
                </button>
              ))}
            </div>
          </div>

          {dateRange !== "week" ? (
            <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-lg text-center text-slate-500">
              Historical data coming soon...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Core Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Total Tasks" value={weekStats.total.all} />
                <MetricCard
                  label="Completed"
                  value={weekStats.total.completed}
                  color="text-emerald-400"
                />
                <MetricCard
                  label="Failed"
                  value={weekStats.total.failed}
                  color="text-rose-400"
                />
                <MetricCard
                  label="Completion"
                  value={`${
                    weekStats.total.all > 0
                      ? Math.round(
                          (weekStats.total.completed / weekStats.total.all) *
                            100
                        )
                      : 0
                  }%`}
                  color="text-indigo-400"
                />
              </div>

              {/* Tasks per Day Chart */}
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800">
                <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
                  Activity by Day
                </h3>
                <div className="space-y-2">
                  {weekStats.byDay.map((day) => {
                    const max = Math.max(
                      ...weekStats.byDay.map((d) => d.total)
                    );
                    const percent = max > 0 ? (day.total / max) * 100 : 0;
                    return (
                      <div
                        key={day.label}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="w-24 text-slate-400">{day.label}</span>
                        <div className="flex-1 h-4 bg-slate-700/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            className="h-full bg-indigo-500/80"
                          />
                        </div>
                        <span className="w-8 text-right text-slate-300">
                          {day.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tasks per Goal */}
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800">
                <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
                  Goal Progress
                </h3>
                <div className="space-y-3">
                  {goalStats.map((goal) => (
                    <div key={goal.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-200">
                          {goal.emoji} {goal.name}
                        </span>
                        <span className="text-slate-400">
                          {goal.stats.completed} / {goal.stats.total}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.stats.completionRate}%` }}
                          className={`h-full rounded-full ${
                            goal.stats.completionRate >= 80
                              ? "bg-emerald-500"
                              : goal.stats.completionRate >= 50
                              ? "bg-amber-500"
                              : "bg-slate-500"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                  {goalStats.length === 0 && (
                    <div className="text-slate-500 text-sm">
                      No goals linked yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Companions Analytics Placeholder */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <IconUsers className="w-5 h-5 text-pink-400" />
              Shared Experiences
            </h2>
            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 p-6 rounded-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-medium text-indigo-200 mb-2">
                  Weekly Summary
                </h3>
                <p className="text-indigo-100/80 leading-relaxed text-sm">
                  {companionStats.total > 0
                    ? `You've been active socially this week! You completed ${companionStats.completed} shared activities. ` +
                      (companionStats.topCompanionName
                        ? `Most of your time was spent with ${companionStats.topCompanionName}.`
                        : "")
                    : "No shared activities recorded this week yet."}
                  <br />
                  <br />
                  <span className="text-xs uppercase tracking-wide opacity-50 block mt-2">
                    AI Insights coming soon
                  </span>
                </p>
              </div>
              {/* Decorative background blob */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color = "text-slate-100",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-center">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-slate-400 uppercase tracking-wide mt-1">
        {label}
      </span>
    </div>
  );
}

interface GoalCardProps {
  goal: Goal & {
    stats: { completionRate: number; completed: number; total: number };
  };
  onUpdate: (id: string, name: string, emoji: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  setEditingId: (id: string | null) => void;
}

function GoalCard({
  goal,
  onUpdate,
  onDelete,
  isEditing,
  setEditingId,
}: GoalCardProps) {
  const [editName, setEditName] = useState(goal.name);
  const [editEmoji, setEditEmoji] = useState(goal.emoji || "🎯");

  if (isEditing) {
    return (
      <div className="bg-slate-800 p-4 rounded-xl border border-indigo-500/50 shadow-lg flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            className="w-12 bg-slate-900 border border-slate-600 rounded p-1 text-center text-lg outline-none focus:border-indigo-500"
            value={editEmoji}
            onChange={(e) => setEditEmoji(e.target.value)}
          />
          <input
            className="flex-1 bg-slate-900 border border-slate-600 rounded p-1 px-3 text-slate-100 outline-none focus:border-indigo-500"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setEditingId(null)}
            className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate(goal.id, editName, editEmoji)}
            className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 p-4 rounded-xl transition-all group relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-xl">
            {goal.emoji}
          </div>
          <div>
            <h3 className="font-medium text-slate-200">{goal.name}</h3>
            <div className="text-xs text-slate-400 mt-0.5">
              {goal.stats.total} linked tasks
            </div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditName(goal.name);
              setEditEmoji(goal.emoji || "🎯");
              setEditingId(goal.id);
            }}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded"
            title="Edit"
          >
            <IconEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => confirm("Delete this goal?") && onDelete(goal.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded"
            title="Delete"
          >
            <IconTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Week Progress</span>
          <span>{goal.stats.completionRate}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.stats.completionRate}%` }}
            className={`h-full rounded-full ${
              goal.stats.completionRate === 100
                ? "bg-emerald-500"
                : "bg-indigo-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

