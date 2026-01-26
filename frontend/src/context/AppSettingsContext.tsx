import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { WeeklyItemType } from "../types/weekly";
import { ITEM_TYPE_STYLES } from "../lib/itemTypeConfig";

// Default item type colors derived from existing config
const DEFAULT_ITEM_TYPE_COLORS: Record<WeeklyItemType, string> = {
  task: ITEM_TYPE_STYLES.task.colorHex,
  event: ITEM_TYPE_STYLES.event.colorHex,
  birthday: ITEM_TYPE_STYLES.birthday.colorHex,
  holiday: ITEM_TYPE_STYLES.holiday.colorHex,
};

export interface AppSettings {
  itemTypeColors: Record<WeeklyItemType, string>;
  locationEnabled: boolean;
  taskDetailsSaveMode: "autosave" | "manual";
}

interface AppSettingsContextValue {
  settings: AppSettings;
  setItemTypeColor: (type: WeeklyItemType, color: string) => void;
  setLocationEnabled: (enabled: boolean) => void;
  setTaskDetailsSaveMode: (mode: "autosave" | "manual") => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

const DEFAULT_SETTINGS: AppSettings = {
  itemTypeColors: DEFAULT_ITEM_TYPE_COLORS,
  locationEnabled: true,
  taskDetailsSaveMode: "manual",
};

interface AppSettingsProviderProps {
  children: ReactNode;
}

export function AppSettingsProvider({ children }: AppSettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const saved = localStorage.getItem("app_settings_v1");
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse app settings", e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const setSettingsAndPersist = useCallback((updater: (prev: AppSettings) => AppSettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      localStorage.setItem("app_settings_v1", JSON.stringify(next));
      return next;
    });
  }, []);

  const setItemTypeColor = useCallback((type: WeeklyItemType, color: string) => {
    setSettingsAndPersist((prev) => ({
      ...prev,
      itemTypeColors: {
        ...prev.itemTypeColors,
        [type]: color,
      },
    }));
  }, [setSettingsAndPersist]);

  const setLocationEnabled = useCallback((enabled: boolean) => {
    setSettingsAndPersist((prev) => ({
      ...prev,
      locationEnabled: enabled,
    }));
  }, [setSettingsAndPersist]);

  const setTaskDetailsSaveMode = useCallback((mode: "autosave" | "manual") => {
    setSettingsAndPersist((prev) => ({
      ...prev,
      taskDetailsSaveMode: mode,
    }));
  }, [setSettingsAndPersist]);

  return (
    <AppSettingsContext.Provider
      value={{ settings, setItemTypeColor, setLocationEnabled, setTaskDetailsSaveMode }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettings {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }
  return context.settings;
}

export function useSetAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useSetAppSettings must be used within an AppSettingsProvider");
  }
  return {
    setItemTypeColor: context.setItemTypeColor,
    setLocationEnabled: context.setLocationEnabled,
    setTaskDetailsSaveMode: context.setTaskDetailsSaveMode,
  };
}

// Helper to get the effective color for a given item type
export function getItemTypeColor(
  type: WeeklyItemType,
  settings: AppSettings
): string {
  return settings.itemTypeColors[type] ?? DEFAULT_ITEM_TYPE_COLORS[type];
}

// @ts-expect-error - Vite specific hot module replacement
if (import.meta.hot) {
  import.meta.hot.decline();
}
