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
}

interface AppSettingsContextValue {
  settings: AppSettings;
  setItemTypeColor: (type: WeeklyItemType, color: string) => void;
  setLocationEnabled: (enabled: boolean) => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

const DEFAULT_SETTINGS: AppSettings = {
  itemTypeColors: DEFAULT_ITEM_TYPE_COLORS,
  locationEnabled: true,
};

interface AppSettingsProviderProps {
  children: ReactNode;
}

export function AppSettingsProvider({ children }: AppSettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const setItemTypeColor = useCallback((type: WeeklyItemType, color: string) => {
    setSettings((prev) => ({
      ...prev,
      itemTypeColors: {
        ...prev.itemTypeColors,
        [type]: color,
      },
    }));
  }, []);

  const setLocationEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      locationEnabled: enabled,
    }));
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{ settings, setItemTypeColor, setLocationEnabled }}
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
  };
}

// Helper to get the effective color for a given item type
export function getItemTypeColor(
  type: WeeklyItemType,
  settings: AppSettings
): string {
  return settings.itemTypeColors[type] ?? DEFAULT_ITEM_TYPE_COLORS[type];
}
