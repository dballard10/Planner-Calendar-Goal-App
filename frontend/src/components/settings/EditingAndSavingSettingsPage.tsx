import { IconArrowLeft, IconDeviceFloppy, IconClick } from "@tabler/icons-react";
import { useAppSettings, useSetAppSettings } from "../../context/AppSettingsContext";

interface EditingAndSavingSettingsPageProps {
  onBack: () => void;
}

export function EditingAndSavingSettingsPage({ onBack }: EditingAndSavingSettingsPageProps) {
  const settings = useAppSettings();
  const { setTaskDetailsSaveMode } = useSetAppSettings();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-100 transition-colors rounded-md hover:bg-slate-800"
          title="Back to Settings"
        >
          <IconArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-slate-100">Editing and Saving</h2>
      </div>

      <div className="space-y-6">
        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-6">
            <div className="mt-1 text-blue-400">
              <IconDeviceFloppy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-100">Task Details Save Mode</h3>
              <p className="text-sm text-slate-400">
                Choose how changes are saved when editing task details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setTaskDetailsSaveMode("autosave")}
              className={`flex flex-col gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                settings.taskDetailsSaveMode === "autosave"
                  ? "bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/50"
                  : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  settings.taskDetailsSaveMode === "autosave" ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-300"
                }`}>
                  <IconClick className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-100 text-sm">Autosave</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Changes are saved to the backend immediately as you type or change fields.
              </p>
            </button>

            <button
              onClick={() => setTaskDetailsSaveMode("manual")}
              className={`flex flex-col gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                settings.taskDetailsSaveMode === "manual"
                  ? "bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/50"
                  : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  settings.taskDetailsSaveMode === "manual" ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"
                }`}>
                  <IconDeviceFloppy className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-100 text-sm">Manual Save</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Changes are buffered locally. Click the checkmark or click off to save to the backend.
              </p>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
